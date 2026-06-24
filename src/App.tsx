import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TitleScreen from './screens/TitleScreen';
import GameScreen from './screens/GameScreen';
import EndingScreen from './screens/EndingScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TitleScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/ending" element={<EndingScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
