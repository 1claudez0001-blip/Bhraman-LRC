import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import MainApp from '@/pages/MainApp'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </Router>
  )
}
