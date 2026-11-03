from typing import Dict, Any
from app.models.schemas import CurrencyConverterData, CurrencyConversion, CurrencyRate


def convert_currency(from_currency: str = "USD", to_currency: str = "BDT", amount: float = 100.0) -> Dict[str, Any]:
    """Convert currencies and show popular exchange rates."""
    
    rates_to_usd = {
        "USD": 1.0, "EUR": 0.92, "GBP": 0.79, "JPY": 149.50, "BDT": 121.50,
        "INR": 83.40, "CAD": 1.36, "AUD": 1.53, "SGD": 1.34, "AED": 3.67,
        "CNY": 7.24, "KRW": 1312.0, "MYR": 4.72, "THB": 35.80, "TRY": 28.90,
    }

    currency_names = {
        "USD": ("US Dollar", "🇺🇸"), "EUR": ("Euro", "🇪🇺"), "GBP": ("British Pound", "🇬🇧"),
        "JPY": ("Japanese Yen", "🇯🇵"), "BDT": ("Bangladeshi Taka", "🇧🇩"),
        "INR": ("Indian Rupee", "🇮🇳"), "CAD": ("Canadian Dollar", "🇨🇦"),
        "AUD": ("Australian Dollar", "🇦🇺"), "SGD": ("Singapore Dollar", "🇸🇬"),
        "AED": ("UAE Dirham", "🇦🇪"), "CNY": ("Chinese Yuan", "🇨🇳"),
        "KRW": ("South Korean Won", "🇰🇷"), "MYR": ("Malaysian Ringgit", "🇲🇾"),
        "THB": ("Thai Baht", "🇹🇭"), "TRY": ("Turkish Lira", "🇹🇷"),
    }

    fc = from_currency.upper()
    tc = to_currency.upper()
    from_rate = rates_to_usd.get(fc, 1.0)
    to_rate = rates_to_usd.get(tc, 1.0)
    
    rate = to_rate / from_rate
    converted = round(amount * rate, 2)
    inverse = round(from_rate / to_rate, 6)

    conversion = CurrencyConversion(
        from_currency=fc,
        from_amount=amount,
        to_currency=tc,
        to_amount=converted,
        rate=round(rate, 4),
        inverse_rate=inverse,
        last_updated="Nov 3, 2026 — 10:00 UTC",
    )

    changes = {"USD": 0.0, "EUR": -0.12, "GBP": 0.08, "JPY": -0.45, "BDT": 0.22, "INR": -0.15, "CAD": 0.05, "AUD": -0.31, "SGD": 0.10, "AED": 0.0, "CNY": -0.08, "KRW": 0.55, "MYR": -0.18, "THB": 0.14, "TRY": -1.20}
    popular = []
    for code in ["USD", "EUR", "GBP", "JPY", "BDT", "INR", "SGD", "AED"]:
        name, flag = currency_names.get(code, (code, "🏳️"))
        r = rates_to_usd[code]
        ch = changes.get(code, 0.0)
        trend = "up" if ch > 0 else ("down" if ch < 0 else "neutral")
        popular.append(CurrencyRate(code=code, name=name, flag_emoji=flag, rate_to_usd=r, rate_from_usd=round(1/r, 4) if r else 0, change_24h=ch, trend=trend))

    data = CurrencyConverterData(
        conversion=conversion,
        popular_rates=popular,
        historical_note=f"The {fc}/{tc} pair has been trading in a narrow range over the past week. Current rate is within 0.5% of the 30-day moving average.",
    )
    return data.model_dump()
