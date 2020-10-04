import React, { useEffect, useState } from 'react';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import './App.css';
import { Card, CardContent, Select } from '@material-ui/core';
import InfoBox from './InfoBox';
import Table from './Table';
import Map from './Map';
import { prettyPrintStat, sortData } from './util';
import LineGraph from './LineGraph';
import 'leaflet/dist/leaflet.css';

function App() {
  const [country, setCountry] = useState('IN');
  const [countries, setCountries] = useState([]);
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState('cases');
  const [mapCenter, setMapCenter] = useState({
    lat: 12.972442,
    lng: 77.580643,
  });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);

  //https://disease.sh/v3/covid-19/countries
  // .map((d)=>(return))

  useEffect(() => {
    //'https://disease.sh/v3/covid-19/all

    fetch('https://disease.sh/v3/covid-19/countries/IN')
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
        .then((response) => response.json())
        
        .then((data) => {
          const countries = data.map((country) => ({
            
            //return
            name: country.country, // name:UniteStates

            value: country.countryInfo.iso2, //USA
          }));
          console.log('countries data', countries);
          setMapCountries(data);
          const sorteddata = sortData(data);
          setCountries(countries);
          setTableData(sorteddata);
        });
    };
    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode);
    const url =
      countryCode === 'WorldWide'
        ? 'https://disease.sh/v3/covid-19/all'
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // setCountry(countryCode);
        setCountryInfo(data);

        countryCode === 'WorldWide'
          ? setMapCenter({ lat: 12.972442, lng: 77.580643 })
          : setMapCenter([data.countryInfo.lat, data.countryInfo.long]);

        setMapZoom(4);
      });
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1 className="app__headerTitle">COVID(19) TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select
              value={country}
              variant="outlined"
              onChange={onCountryChange}
            >
              <MenuItem value="WorldWide">WorldWide</MenuItem>
              {
                //get country code and display name
                countries.map((country) => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox
            isRed
            active={casesType === 'cases'}
            onClick={(e) => setCasesType('cases')}
            title={'CoronaVirus Cases'}
            cases={countryInfo.todayCases}
            total={prettyPrintStat(countryInfo.cases)}
          />

          <InfoBox
            active={casesType === 'recovered'}
            onClick={(e) => setCasesType('recovered')}
            title={'Recovered'}
            cases={countryInfo.todayRecovered}
            total={prettyPrintStat(countryInfo.recovered)}
          />

          <InfoBox
            isRed
            active={casesType === 'deaths'}
            onClick={(e) => setCasesType('deaths')}
            title={'Deaths'}
            cases={countryInfo.todayDeaths}
            total={countryInfo.deaths}
          />
        </div>

        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>

      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle">WorldWide New {casesType}</h3>

          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>

        {/* { table,graph} */}
      </Card>
    </div>
  );
}

export default App;
