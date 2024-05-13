import "./App.css";
import Homepage from "./Pages/HomePage";
import { Route } from "react-router-dom";
import Chatpage from "./Pages/ChatPage";
import MenuPage from "./Pages/MenuPage";

function App() {
  return (
    <div className="App">
      <Route path="/" component={Homepage} exact />
      <Route path="/menu" component={MenuPage} />
      <Route path="/chats" component={Chatpage} />
    </div>
  );
}

export default App;
