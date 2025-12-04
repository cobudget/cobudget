import { createContext } from "react";

interface IAppContext {
  ss?: any;
}

const AppContext = createContext<IAppContext>({});

export default AppContext;
