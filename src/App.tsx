import { useEffect, useState } from "react";
import "./App.css";
import { fetchWeatherApi } from "openmeteo";

function App() {
  const my_location = "Pokhara";
  const [myLocationLongitude, setMyLocationLongitude] = useState(null);
  const [myLocationLatitude, setMyLocationLatitude] = useState(null);
  const [myLocationTimezone, setMyLocationTimezone] = useState(null);

  const [sevenDaysForecast, setSevenDaysForecast] = useState(null);
  const [todaysForecast, setTodaysForecast] = useState(null);


  //weather states
  // const weatherApiParams =
  //   myLocationLatitude && myLocationLongitude && myLocationTimezone
  //     ? {
  //         "latitude": myLocationLatitude,
  //         "longitude": myLocationLongitude,
  //         "hourly": "temperature_2m",
  //         "timezone": myLocationTimezone,
  //         "format": "json"
  //       }
  //     : null;

  const getMyLocationDetails = async () => {
    await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${my_location}%2C%20Nepal&format=json&apiKey=57ac1294aeb340c0bfde9e112bc97f41`
    )
      .then((response) => response.json())
      .then((result) => {
        const myLocationDetails = result.results[0];
        console.log(myLocationDetails);
        setMyLocationLatitude(myLocationDetails.lat);
        setMyLocationLongitude(myLocationDetails.lon);
        setMyLocationTimezone(myLocationDetails.timezone.name);
      })
      .catch((error) => console.log("error", error));
  };

  useEffect(() => {
    getMyLocationDetails();
  }, []);

  useEffect(() => {
    console.log("myLocationLatitude: ", myLocationLatitude);
    console.log("myLocationLongitude: ", myLocationLongitude);
    console.log("myLocationTimezone: ", myLocationTimezone);
  }, [myLocationLatitude, myLocationLongitude, myLocationTimezone]);

  //weather api url
  const weatherApiUrl =
    myLocationLatitude && myLocationLongitude && myLocationTimezone
      ? `https://api.open-meteo.com/v1/forecast?latitude=${myLocationLatitude}&longitude=${myLocationLongitude}&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset&timezone=${myLocationTimezone}`
      : null;

  const todayWeatherApiUrl =
    myLocationLatitude && myLocationLongitude && myLocationTimezone
      ? `https://api.open-meteo.com/v1/forecast?latitude=${myLocationLatitude}&longitude=${myLocationLongitude}&minutely_15=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,direct_radiation&timezone=${myLocationTimezone}`
      : null;

  const getWeatherInformation7days = async () => {
    if (weatherApiUrl) {
      try {
        const responses = await fetch(weatherApiUrl);

        if (responses) {
          const weatherData = await responses.json();
          console.log("Weather information: ", weatherData);
          setSevenDaysForecast(weatherData);
        }
      } catch (error) {
        console.log("Failed fetching weather information with error: ", error);
      }
    }
  };

  const getWeatherInformationToday = async () => {
    if (todayWeatherApiUrl) {
      try {
        const responses = await fetch(todayWeatherApiUrl);

        if (responses) {
          const todaysWeatherData = await responses.json();
          console.log("Todays weather information: ", todaysWeatherData);
          setTodaysForecast(todaysWeatherData);
        }
      } catch (error) {
        console.log("Failed fetching weather information with error: ", error);
      }
    }
  };

  useEffect(() => {
    getWeatherInformation7days();
  }, []);

  useEffect(() => {
    getWeatherInformation7days();
  }, [myLocationLatitude, myLocationLongitude, myLocationTimezone]);

  useEffect(() => {
    getWeatherInformationToday();

    //call every 15 minutes
    const intervalId = setInterval(getWeatherInformationToday, 15 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    getWeatherInformationToday();

    //call every 15 minutes
    const intervalId = setInterval(getWeatherInformationToday, 15 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [myLocationLatitude, myLocationLongitude, myLocationTimezone]);

  return <main>hello Ram</main>;
}

export default App;
