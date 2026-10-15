import { useLocation } from "react-router-dom";

export const LocationProbe = () => {
  const { pathname } = useLocation();
  return <p data-testid="location">{pathname}</p>;
};
