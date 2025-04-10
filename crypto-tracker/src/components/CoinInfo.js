import axios from "axios";
import { useEffect, useState } from "react";
import { HistoricalChart } from "../config/api";
import { Line } from "react-chartjs-2";
import {
  CircularProgress,
  createTheme,
  ThemeProvider,
  Alert,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import SelectButton from "./SelectButton";
import { chartDays } from "../config/data";
import { CryptoState } from "../CryptoContext";
// Import Chart.js and the required scales
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register the required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Create theme outside component
const theme = createTheme({
  palette: {
    primary: {
      main: "#fff",
    },
    mode: "dark",
  },
});

// Define styles with theme
const useStyles = makeStyles(() => ({
  container: {
    width: "75%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
    padding: 40,
    [theme.breakpoints.down("md")]: {
      width: "100%",
      marginTop: 0,
      padding: 20,
      paddingTop: 0,
    },
  },
  errorMessage: {
    width: "100%",
    padding: 10,
    marginBottom: 20,
  }
}));

const CoinInfo = ({ coin }) => {
  const [historicData, setHistoricData] = useState();
  const [days, setDays] = useState(1);
  const { currency } = CryptoState();
  const [flag, setflag] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const classes = useStyles();

  const fetchHistoricData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data } = await axios.get(HistoricalChart(coin.id, days, currency), {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging requests
        timeout: 10000
      });
      
      setHistoricData(data.prices);
      setflag(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response && error.response.status === 429) {
        setError("Rate limit exceeded. Please try again in a few minutes.");
      } else if (error.code === "ERR_NETWORK") {
        setError("Network error. CoinGecko API may be unavailable or blocking requests.");
      } else {
        setError("Failed to fetch price data. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (coin?.id) {
      fetchHistoricData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, currency, coin?.id]);

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.container}>
        {error && (
          <Alert severity="error" className={classes.errorMessage}>
            {error}
          </Alert>
        )}
        
        {(loading || (!historicData && !error)) ? (
          <CircularProgress
            style={{ color: "gold" }}
            size={250}
            thickness={1}
          />
        ) : !error && historicData ? (
          <>
            <Line
              data={{
                labels: historicData.map((coin) => {
                  let date = new Date(coin[0]);
                  let time =
                    date.getHours() > 12
                      ? `${date.getHours() - 12}:${date.getMinutes()} PM`
                      : `${date.getHours()}:${date.getMinutes()} AM`;
                  return days === 1 ? time : date.toLocaleDateString();
                }),

                datasets: [
                  {
                    data: historicData.map((coin) => coin[1]),
                    label: `Price ( Past ${days} Days ) in ${currency}`,
                    borderColor: "#EEBC1D",
                  },
                ],
              }}
              options={{
                elements: {
                  point: {
                    radius: 1,
                  },
                },
                scales: {
                  x: {
                    type: 'category',
                    display: true,
                  },
                  y: {
                    type: 'linear',
                    display: true,
                  }
                }
              }}
            />
            <div
              style={{
                display: "flex",
                marginTop: 20,
                justifyContent: "space-around",
                width: "100%",
              }}
            >
              {chartDays.map((day) => (
                <SelectButton
                  key={day.value}
                  onClick={() => {
                    setDays(day.value);
                    setflag(false);
                  }}
                  selected={day.value === days}
                >
                  {day.label}
                </SelectButton>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </ThemeProvider>
  );
};

export default CoinInfo;