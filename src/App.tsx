import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import EndingScreen from './screens/EndingScreen';
import GameScreen from './screens/GameScreen';
import TitleScreen from './screens/TitleScreen';

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
