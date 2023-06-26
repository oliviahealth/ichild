import ChatComponent from "./components/Chat";
import SidePanel from "./components/SidePanel";

function App() {
  return (
    <div className="grid grid-cols-5 h-full">
      <div className="col-span-1 shadow-lg">
       <SidePanel />
      </div>

      <div className="col-span-4 bg-opacity-80 bg-gray-100">
        <ChatComponent />
      </div>
    </div>
  );
}

export default App;
