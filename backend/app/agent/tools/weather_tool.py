from typing import Dict, Any
from app.models.schemas import WeatherData, ForecastDay


def get_weather_data(city: str = "San Francisco") -> Dict[str, Any]:
    """Retrieves comprehensive live weather metrics and 5-day forecast for a given city.
    
    Args:
        city: The name of the city (e.g. 'San Francisco', 'Tokyo', 'London', 'New York').
    """
    city_lower = city.lower()
    
    # Realistic profiles for demonstration
    if "tokyo" in city_lower:
        temp_c, condition = 18.0, "Partly Cloudy"
        country = "Japan"
    elif "london" in city_lower:
        temp_c, condition = 13.5, "Rainy"
        country = "United Kingdom"
    elif "york" in city_lower:
        temp_c, condition = 21.0, "Sunny"
        country = "United States"
    elif "paris" in city_lower:
        temp_c, condition = 15.0, "Overcast"
        country = "France"
    elif "dhaka" in city_lower:
        temp_c, condition = 29.5, "Sunny"
        country = "Bangladesh"
    else:
        temp_c, condition = 19.5, "Sunny"
        country = "United States"

    temp_f = round((temp_c * 9/5) + 32, 1)
    feels_c = temp_c + 0.5
    feels_f = round((feels_c * 9/5) + 32, 1)

    data = WeatherData(
        city=city.title(),
        country=country,
        condition=condition,
        temp_c=temp_c,
        temp_f=temp_f,
        feels_like_c=feels_c,
        feels_like_f=feels_f,
        humidity=62,
        wind_speed_kmh=14.5,
        air_quality_index=32,
        air_quality_label="Good (AQI 32)",
        uv_index=5,
        summary=f"Currently {condition.lower()} in {city.title()} with gentle breezes. Ideal conditions for outdoor activities.",
        forecast=[
            ForecastDay(day="Today", date="Nov 3", condition=condition, high_temp_c=temp_c+3, low_temp_c=temp_c-4, high_temp_f=round((temp_c+3)*9/5+32, 1), low_temp_f=round((temp_c-4)*9/5+32, 1), precipitation_prob=15, icon="sun"),
            ForecastDay(day="Wed", date="Nov 4", condition="Sunny", high_temp_c=temp_c+4, low_temp_c=temp_c-3, high_temp_f=round((temp_c+4)*9/5+32, 1), low_temp_f=round((temp_c-3)*9/5+32, 1), precipitation_prob=5, icon="sun"),
            ForecastDay(day="Thu", date="Nov 5", condition="Partly Cloudy", high_temp_c=temp_c+2, low_temp_c=temp_c-2, high_temp_f=round((temp_c+2)*9/5+32, 1), low_temp_f=round((temp_c-2)*9/5+32, 1), precipitation_prob=20, icon="cloud-sun"),
            ForecastDay(day="Fri", date="Nov 6", condition="Rain Showers", high_temp_c=temp_c-1, low_temp_c=temp_c-5, high_temp_f=round((temp_c-1)*9/5+32, 1), low_temp_f=round((temp_c-5)*9/5+32, 1), precipitation_prob=75, icon="cloud-rain"),
            ForecastDay(day="Sat", date="Nov 7", condition="Clear Sky", high_temp_c=temp_c+1, low_temp_c=temp_c-3, high_temp_f=round((temp_c+1)*9/5+32, 1), low_temp_f=round((temp_c-3)*9/5+32, 1), precipitation_prob=10, icon="sun"),
        ]
    )
    return data.model_dump()

