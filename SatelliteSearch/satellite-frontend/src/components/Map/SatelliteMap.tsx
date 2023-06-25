import { useState, useMemo, useEffect } from 'react';
import Map, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
} from 'react-map-gl';

import { useAppSelector } from '~/hooks/useAppSelector';
import { selectCurrentEntry, selectList } from '~/store/slices/satellite';
import { Satellite } from '~/types/satellite';
import Pin from '~/components/Map/Pin';
import { Container, Typography } from '@mui/material';

const TOKEN =
  'pk.eyJ1IjoiY2FuZGFzNDAwIiwiYSI6ImNsamJuOW96NzAxczUzY3FtcXNnbTVqYmwifQ.P-vJe5tb-mF7Vf9R0NGVbg'; // Set your mapbox token here

export default function SatelliteMap() {
  const [popupInfo, setPopupInfo] = useState<Satellite | null>(null);
  const satellites = useAppSelector(selectList);
  const selectedSatellite = useAppSelector(selectCurrentEntry);

  useEffect(() => {
    if (selectedSatellite) {
      setViewState({
        longitude: selectedSatellite?.longitude,
        latitude: selectedSatellite?.latitude,
        zoom: 3.5,
      });
      setPopupInfo(selectedSatellite);
    } else {
      setPopupInfo(null);
    }
  }, [selectedSatellite]);

  const [viewState, setViewState] = useState({
    longitude: -100,
    latitude: 40,
    zoom: 3.5,
  });

  const pins = useMemo(
    () =>
      satellites.map((element: Satellite, index: number) => (
        <Marker
          key={`marker-${index}`}
          longitude={Number.parseFloat(element.longitude)}
          latitude={Number.parseFloat(element.latitude)}
          anchor='bottom'
          onClick={(e) => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
            setPopupInfo(element);
          }}
        >
          <Pin />
        </Marker>
      )),
    [satellites],
  );

  return (
    <Container
      sx={{
        width: '900px',
        height: '600px',
      }}
    >
      <Map
        initialViewState={{
          latitude: 45,
          longitude: -95,
          zoom: 1.5,
        }}
        onMove={(evt) => setViewState(evt.viewState)}
        {...viewState}
        mapStyle='mapbox://styles/mapbox/dark-v9'
        mapboxAccessToken={TOKEN}
      >
        <GeolocateControl position='top-left' />
        <FullscreenControl position='top-left' />
        <NavigationControl position='top-left' />
        <ScaleControl />
        {pins}
        {popupInfo && (
          <Popup
            anchor='top'
            longitude={Number(popupInfo.longitude)}
            latitude={Number(popupInfo.latitude)}
            onClose={() => setPopupInfo(null)}
          >
            <Typography>Name: {popupInfo.name}</Typography>
            <Typography>Owner: {popupInfo.owner}</Typography>
            <Typography>Latitude: {popupInfo.latitude}</Typography>
            <Typography>Longitude: {popupInfo.longitude}</Typography>
          </Popup>
        )}
      </Map>
    </Container>
  );
}
