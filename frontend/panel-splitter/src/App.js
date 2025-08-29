import './App.css';
import { UploadSection } from './components/UploadSection';
import { ThemeGrid } from './components/ThemeGrid';
import { ThemeDownloadControls } from './components/ThemeDownloadControls';
import { DurationControl } from './components/DurationControl';
import { PanelTable } from './components/PanelTable';
import { TeamTable } from './components/TeamTable';
import { PanelDownloadControls } from './components/PanelDownloadControls';

function App() {
  return (
    <div className="ps-root">
      <header className="ps-header">PANEL SPLITTER</header>
      <UploadSection />
      <ThemeGrid />
      <ThemeDownloadControls />
      <DurationControl />
      <div className="ps-tables">
        <PanelTable />
        <TeamTable />
      </div>
      <PanelDownloadControls />
    </div>
  );
}

export default App;
