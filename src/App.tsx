import { useEffect, useState } from "react";
import "./App.css";
// import { fetchWeatherApi } from "openmeteo";

function App() {
  const search_location = "Pokhara";
  const [myLocation, setMyLocation] = useState<string | null>(null);
  const [myLocationLongitude, setMyLocationLongitude] = useState(null);
  const [myLocationLatitude, setMyLocationLatitude] = useState(null);
  const [myLocationTimezone, setMyLocationTimezone] = useState(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sevenDaysForecast, setSevenDaysForecast] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [todaysForecast, setTodaysForecast] = useState<any>(null);
  const [currentTimeIndex, setCurrentTimeIndex] = useState<number>();

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
      `https://api.geoapify.com/v1/geocode/search?text=${search_location}%2C%20Nepal&format=json&apiKey=57ac1294aeb340c0bfde9e112bc97f41`
    )
      .then((response) => response.json())
      .then((result) => {
        const myLocationDetails = result.results[0];
        // console.log(myLocationDetails);
        setMyLocation(
          `${myLocationDetails.address_line1}, ${myLocationDetails.address_line2}`
        );
        setMyLocationLatitude(myLocationDetails.lat);
        setMyLocationLongitude(myLocationDetails.lon);
        setMyLocationTimezone(myLocationDetails.timezone.name);
      })
      .catch((error) => console.log("error", error));
  };

  useEffect(() => {
    getMyLocationDetails();
  }, []);

  // useEffect(() => {
  //   console.log("myLocationLatitude: ", myLocationLatitude);
  //   console.log("myLocationLongitude: ", myLocationLongitude);
  //   console.log("myLocationTimezone: ", myLocationTimezone);
  // }, [myLocationLatitude, myLocationLongitude, myLocationTimezone]);

  //weather api url
  const weatherApiUrl =
    myLocationLatitude && myLocationLongitude && myLocationTimezone
      ? `https://api.open-meteo.com/v1/forecast?latitude=${myLocationLatitude}&longitude=${myLocationLongitude}&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset&timezone=${myLocationTimezone}`
      : null;

  const todayWeatherApiUrl =
    myLocationLatitude && myLocationLongitude && myLocationTimezone
      ? `https://api.open-meteo.com/v1/forecast?latitude=${myLocationLatitude}&longitude=${myLocationLongitude}&minutely_15=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,direct_radiation&timezone=${myLocationTimezone}`
      : null;

  function findIndexOfCurrentTime(timeArray: string[]) {
    const currentTime = new Date().toISOString().slice(0, 16);

    let found = false;

    // Iterate through the array
    for (let i = 0; i < timeArray.length; i++) {
      // Compare each time string with the current time
      // console.log("timeArray[i] >= currentTime: ", timeArray[i] >= currentTime);

      if (timeArray[i] >= currentTime && found == false) {
        setCurrentTimeIndex(i); // Return the index when a time is greater than or equal to the current time
        found = true;
      }
    }

    if (found == false) setCurrentTimeIndex(-1);
  }

  const updateIndexOfCurrentTime = () => {
    if (todaysForecast) {
      const timeArray = todaysForecast.minutely_15.time.slice(0, 96); //slice done to get the time of just today
      findIndexOfCurrentTime(timeArray);
    }
  };

  useEffect(() => {
    updateIndexOfCurrentTime();
  }, []);

  useEffect(() => {
    updateIndexOfCurrentTime();
  }, [todaysForecast]);

  // useEffect(() => {
  //   console.log("currentTimeIndex: ", currentTimeIndex);
  // }, [currentTimeIndex]);

  const getWeatherInformation7days = async () => {
    if (weatherApiUrl) {
      try {
        const responses = await fetch(weatherApiUrl);

        if (responses) {
          const weatherData = await responses.json();
          // console.log("Weather information: ", weatherData);
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
          // console.log("Todays weather information: ", todaysWeatherData);
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

  function getDayFromDate(dateString: string) {
    // Create a new Date object from the dateString
    const date = new Date(dateString);

    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayIndex = date.getDay();
    const dayName = daysOfWeek[dayIndex];

    return dayName;
  }

  function convertTimeToAMPM(timeString: string) {
    const date = new Date(timeString);
    let hours = date.getHours();
    let minutes: string | number = date.getMinutes();
    const ampm = hours >= 12 ? "P.M." : "A.M.";
    hours %= 12;
    hours = hours || 12; // Handle midnight (0 hours)

    // Add leading zero to minutes if necessary
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return hours + ":" + minutes + " " + ampm;
  }

  //make it dynamic in every 15minutes
  const todaysTemperature =
    todaysForecast && currentTimeIndex &&
    `${todaysForecast.minutely_15.temperature_2m[currentTimeIndex]} ${todaysForecast.minutely_15_units.temperature_2m}`;
  const todaysSunrise =
    sevenDaysForecast && convertTimeToAMPM(sevenDaysForecast.daily.sunrise[0]);
  const todaysSunset =
    sevenDaysForecast && convertTimeToAMPM(sevenDaysForecast.daily.sunset[0]);

  //make it dynamic in every 15minutes
  const todaysWeatherCondition =
    todaysForecast && currentTimeIndex &&
    (todaysForecast.minutely_15.weather_code[currentTimeIndex] == 0
      ? "Sunny"
      : todaysForecast.minutely_15.weather_code[currentTimeIndex] == 1 ||
        todaysForecast.minutely_15.weather_code[currentTimeIndex] == 2 ||
        todaysForecast.minutely_15.weather_code[currentTimeIndex] == 3
      ? "Cloudy"
      : "Rainy");
  //make it dynamic in every 15minutes
  const weatherImgUrl =
    todaysForecast && currentTimeIndex &&
    (todaysForecast.minutely_15.weather_code[currentTimeIndex] == 0
      ? "./images/contrast.png"
      : todaysForecast.minutely_15.weather_code[currentTimeIndex] == 1 ||
        todaysForecast.minutely_15.weather_code[currentTimeIndex] == 2 ||
        todaysForecast.minutely_15.weather_code[currentTimeIndex] == 3
      ? "./images/cloudy.png"
      : "./images/rain.png");

  const humidity =
    todaysForecast && currentTimeIndex &&
    `${todaysForecast.minutely_15.relative_humidity_2m[currentTimeIndex]} ${todaysForecast.minutely_15_units.relative_humidity_2m}`;
  const wind_speed =
    todaysForecast && currentTimeIndex &&
    `${todaysForecast.minutely_15.wind_speed_10m[currentTimeIndex]} ${todaysForecast.minutely_15_units.wind_speed_10m}`;
  const uv =
    todaysForecast && currentTimeIndex && `${todaysForecast.minutely_15.direct_radiation[currentTimeIndex]}`;

  interface weatherDataType {
    temperature: string;
    day: string;
    imgUrl: string;
  }

  const [sevenDaysForecastExtractedData, setSevenDaysForecastExtractedData] =
    useState<weatherDataType[]>();

  const updateSevenDaysForecastExtractedData = () => {
    // console.log("called me!");

    const duplicateArray: weatherDataType[] = Array.from({
      length: 7,
    });
    for (let i = 0; i < 7; i++) {
      if (sevenDaysForecast) {
        duplicateArray[i] = {
          temperature: `${sevenDaysForecast.daily.temperature_2m_max[i]} ${sevenDaysForecast.daily_units.temperature_2m_max} / ${sevenDaysForecast.daily.temperature_2m_min[i]} ${sevenDaysForecast.daily_units.temperature_2m_min}`,
          imgUrl:
            sevenDaysForecast.daily.weather_code[i] == 0
              ? "./images/contrast.png"
              : sevenDaysForecast.daily.weather_code[i] == 1 ||
                sevenDaysForecast.daily.weather_code[i] == 2 ||
                sevenDaysForecast.daily.weather_code[i] == 3
              ? "./images/cloudy.png"
              : "./images/rain.png",
          day: getDayFromDate(sevenDaysForecast.daily.time[i]),
        };
      }
    }
    setSevenDaysForecastExtractedData(duplicateArray);
  };

  useEffect(() => {
    updateSevenDaysForecastExtractedData();
  }, []);

  useEffect(() => {
    updateSevenDaysForecastExtractedData();
  }, [sevenDaysForecast]);

  // useEffect(() => {
  //   console.log(
  //     "sevenDaysForecastExtractedData: ",
  //     sevenDaysForecastExtractedData
  //   );
  // }, [sevenDaysForecastExtractedData]);

  return (
    <main>
      <h2 className=" ">
        Your Location: {myLocation ? myLocation : "Tracking location..."}
      </h2>

      {/*todays weather forecast*/}
      {todaysForecast && sevenDaysForecast ? (
        <div>
          <div>
            <h1>{todaysTemperature}</h1>

            <div>
              <div>
                <span>Sunrise</span>
                <span>{todaysSunrise}</span>
              </div>

              <div>
                <span>Sunset</span>
                <span>{todaysSunset}</span>
              </div>
            </div>
          </div>

          <div>
            <img
              src={weatherImgUrl}
              alt="weather-img"
              className=" h-[155px] w-[155px] object-cover object-center"
            />
            <span>{todaysWeatherCondition}</span>
          </div>

          {/*extra details*/}
          <div>
            <div>
              {/*icon here*/}

              <span>{humidity}</span>
              <span>Humidity</span>
            </div>

            <div>
              {/*icon here*/}

              <span>{wind_speed}</span>
              <span>Wind Speed</span>
            </div>

            <div>
              {/*icon here*/}

              <span>{uv}</span>
              <span>UV</span>
            </div>
          </div>
        </div>
      ) : (
        <span>Loading todays weather forecast</span>
      )}

      {/*7days weather forecast*/}
      <div>
        <h2>7 Days Forecast</h2>

        {sevenDaysForecastExtractedData &&
          sevenDaysForecastExtractedData.every(
            (weatherData) => weatherData != undefined
          ) && (
            <div>
              {sevenDaysForecastExtractedData.slice(1).map((weatherData, i) => {
                const { temperature, day, imgUrl } = weatherData;

                return (
                  <div key={i}>
                    <img
                      src={imgUrl}
                      alt="weather-img"
                      className=" h-[40px] w-[40px] object-cover object-center"
                    />

                    <div>
                      <span>{temperature}</span>
                      <span className=" uppercase">
                        {i == 0 ? "tom" : day.slice(0, 3)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </main>
  );
}

export default App;
