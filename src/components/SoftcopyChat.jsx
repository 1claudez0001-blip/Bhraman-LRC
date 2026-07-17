import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';
import { Send, Paperclip, X, Download, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function FilePreview({ url, name, type }) {
  const isImage = type?.startsWith('image/');
  return (
    <a href={url} target="_blank" rel="noreferrer"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition text-xs font-medium mt-1 group">
      {isImage ? (
        <img src={url} alt={name} className="w-16 h-16 object-cover rounded-lg" />
      ) : (
        <div className="flex items-center gap-2">
          <FileText size={16} />
          <span className="max-w-[150px] truncate">{name}</span>
          <Download size={12} className="opacity-60 group-hover:opacity-100" />
        </div>
      )}
    </a>
  );
}

export default function SoftcopyChat({ request, onClose, onFulfill }) {
  const { session } = useApp();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [adminAcknowledged, setAdminAcknowledged] = useState(request?.admin_acknowledged || false);
  const [showAck, setShowAck] = useState(false);
  const bottomRef = useRef();
  const fileRef = useRef();
  const isStaff = session.userType === 'admin' || session.userType === 'sa';

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('softcopy_messages')
      .select('*, users(name, role)')
      .eq('request_id', request.id)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel(`softcopy:${request.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'softcopy_messages',
        filter: `request_id=eq.${request.id}`,
      }, () => fetchMessages())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [request.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) { toast.error('File type not allowed.'); return; }
    if (f.size > MAX_SIZE) { toast.error('File must be under 10MB.'); return; }
    setFile(f);
  };

  const uploadFile = async () => {
    if (!file) return { url: null, name: null, type: null };
    const ext = file.name.split('.').pop();
    const path = `${request.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('softcopy-files').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('softcopy-files').getPublicUrl(path);
    return { url: data.publicUrl, name: file.name, type: file.type };
  };

  const sendMessage = async () => {
    if (!text.trim() && !file) return;
    if (isStaff && !adminAcknowledged) { setShowAck(true); return; }

    setUploading(true);
    try {
      const { url, name, type } = await uploadFile();
      await supabase.from('softcopy_messages').insert([{
        request_id: request.id,
        sender_id: session.userDbId,
        message: text.trim() || null,
        file_url: url,
        file_name: name,
        file_type: type,
      }]);
      setText('');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch {
      toast.error('Failed to send. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const acknowledgeAndSend = async () => {
    await supabase.from('softcopy_requests').update({ admin_acknowledged: true }).eq('id', request.id);
    setAdminAcknowledged(true);
    setShowAck(false);
    sendMessage();
  };

  const markFulfilled = async () => {
    await supabase.from('softcopy_requests').update({ status: 'fulfilled' }).eq('id', request.id);
    await supabase.from('notifications').insert([{
      user_id: request.user_id,
      title: 'Softcopy Request Fulfilled ✅',
      message: `Your softcopy request has been fulfilled. Check the chat for your files.`,
      type: 'approved',
    }]);
    toast.success('Request marked as fulfilled!');
    onFulfill();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col animate-scale-in overflow-hidden"
        style={{ maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-semibold text-gray-900 text-sm">{request.books?.title}</p>
            <p className="text-xs text-ub-gray">Softcopy Request · {request.users?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            {isStaff && request.status === 'open' && (
              <button onClick={markFulfilled}
                className="inline-flex items-center gap-1 text-xs font-semibold text-ub-green px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 cursor-pointer">
                <CheckCircle size={12} /> Mark Fulfilled
              </button>
            )}
            <button onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Acknowledgement banner */}
        {showAck && (
          <div className="mx-4 mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle size={15} className="text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-yellow-800">Copyright Acknowledgement Required</p>
            </div>
            <p className="text-xs text-yellow-700 mb-3">
              Before sharing files, you must acknowledge that sharing unlicensed copyrighted material may be illegal. You take full responsibility for any files you share through this system.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowAck(false)}
                className="flex-1 py-2 rounded-xl border border-yellow-300 text-yellow-700 text-xs font-semibold cursor-pointer">
                Cancel
              </button>
              <button onClick={acknowledgeAndSend}
                className="flex-1 py-2 rounded-xl bg-yellow-500 text-white text-xs font-semibold hover:bg-yellow-600 cursor-pointer">
                I Acknowledge & Send
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {/* Request reason */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-ub-gray">Request reason</p>
            <p className="text-sm text-gray-700 mt-0.5 italic">"{request.reason}"</p>
            {request.student_acknowledged && (
              <p className="text-[10px] text-green-600 mt-1.5 flex items-center justify-center gap-1">
                <CheckCircle size={10} /> Student acknowledged copyright disclaimer
              </p>
            )}
          </div>

          {messages.map((m) => {
            const isMe = m.sender_id === session.userDbId;
            const isStaffMsg = m.users?.role === 'admin' || m.users?.role === 'sa';
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm
                  ${isMe
                    ? 'bg-ub-red text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                  }`}>
                  {!isMe && (
                    <p className={`text-[10px] font-semibold mb-1 ${isStaffMsg ? 'text-ub-red' : 'text-ub-gray'}`}>
                      {m.users?.name} {isStaffMsg && '· Staff'}
                    </p>
                  )}
                  {m.message && <p className="leading-snug">{m.message}</p>}
                  {m.file_url && <FilePreview url={m.file_url} name={m.file_name} type={m.file_type} />}
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                    {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* File preview */}
        {file && (
          <div className="mx-4 mb-2 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <FileText size={14} className="text-ub-gray shrink-0" />
            <span className="text-xs text-gray-700 truncate flex-1">{file.name}</span>
            <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
              className="cursor-pointer text-ub-gray hover:text-ub-red">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Input */}
        {request.status === 'open' && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
            <button onClick={() => fileRef.current?.click()}
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer shrink-0">
              <Paperclip size={16} className="text-ub-gray" />
            </button>
            <input ref={fileRef} type="file" accept={ALLOWED_TYPES.join(',')} onChange={handleFileChange} className="hidden" />
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none text-sm transition"
            />
            <button
              onClick={sendMessage}
              disabled={uploading || (!text.trim() && !file)}
              className="w-9 h-9 rounded-xl bg-ub-red text-white flex items-center justify-center hover:bg-ub-darkRed transition cursor-pointer disabled:opacity-40 shrink-0"
            >
              {uploading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Send size={15} />
              }
            </button>
          </div>
        )}

        {request.status === 'fulfilled' && (
          <div className="px-4 py-3 border-t border-gray-100 text-center">
            <p className="text-xs text-ub-green font-semibold flex items-center justify-center gap-1">
              <CheckCircle size={12} /> This request has been fulfilled
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
