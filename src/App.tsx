import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import StarsCanvas from './canvas/Stars';
import axios from 'axios';

const Authentication = lazy(() => import('./components/Authentication/Authentication'))
const Main = lazy(() => import('./components/Main'))

interface AstronomyPictureOfTheDay {
  copyright: string;
  date: string;
  explanation: string;
  hdurl: string;
  media_type: string;
  service_version: string;
  title: string;
  url: string;
}

const App = () => {
  const [imageData, setImageData] = useState<null | AstronomyPictureOfTheDay>(null);

  // Redirect To Home component for in case the user goes to an unknown route
  const RedirectToHome = () => {
    const navigate = useNavigate();
    React.useEffect(() => {
      navigate('/');
    }, [navigate]);

    return null;
  }

  // This async function makes a request to the server to fetch the Astronomy Picture of the Day (APOD) data from the specified endpoint.
  // If the request is successful and the server responds with data, it updates the state variable 'imageData' with the received data.
  // In case of an error, it logs the error to the console.
  const getImageOfTheDay = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/image-of-the-day`, { withCredentials: true })
      if (response.status) {
        setImageData(response.data)
      }
    } catch (err: any) {
      console.log(err)
    }
  }

  useEffect(() => {
    getImageOfTheDay()
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={<div className='suspenseLoaderWrapper'><span className="suspenseLoader"></span></div>}>
        <StarsCanvas />
        <Routes>
          <Route path='/' element={<Main imageData={imageData} />} />
          <Route path='/auth' element={<Authentication />} />
          <Route path='*' element={<RedirectToHome />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
