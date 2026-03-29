import { ACTIVE_COMPOSITION, ACTIVE_PLUGIN } from "../shared/project/activeProject.js";
import { PreviewScaffold } from "./scaffold/PreviewScaffold.jsx";

function App() {
  return <PreviewScaffold plugin={ACTIVE_PLUGIN} fps={ACTIVE_COMPOSITION.fps} loop />;
}

export default App;
