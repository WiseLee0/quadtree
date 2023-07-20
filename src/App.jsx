import React, { useEffect } from "react";
import { Hello } from "./hello/hello";
const modulesContext = require.context("./modules", false, /\.js$/);
const modules = modulesContext
  .keys()
  .map((modulePath) => modulesContext(modulePath));
import "./index.css";

function App() {
  useEffect(() => {
    modules;
  }, []);
  return (
    <div className="bg">
      <span>hello world2</span>
      <Hello />
    </div>
  );
}
export default App;
