import { makeStyles } from "@mui/styles";
import Homepage from "./Pages/HomePage";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CoinPage from "./Pages/CoinPage";
import Header from "./components/Header";
import ErrorBoundary from "./components/ErrorBoundary";

const useStyles = makeStyles(() => ({
  App: {
    backgroundColor: "#14161a",
    color: "white",
    minHeight: "100vh",
  },
}));

function App() {
  const classes = useStyles();

  return (
    <BrowserRouter>
      <div className={classes.App}>
        <Header />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/coins/:id" element={<CoinPage />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  );
}

export default App;