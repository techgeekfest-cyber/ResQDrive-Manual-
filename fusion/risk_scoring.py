def calculate_risk_score(
    ai_confidence,
    vehicle_evidence,
    location_agreement,
    freshness
):
    """
    Calculate the overall risk score for a hazard incident.

    Formula:
    40% AI confidence
    30% vehicle evidence
    20% location agreement
    10% freshness
    """

    risk_score = (
        0.40 * ai_confidence
        + 0.30 * vehicle_evidence
        + 0.20 * location_agreement
        + 0.10 * freshness
    )

    return round(risk_score, 4)


def get_risk_level(risk_score):
    """
    Convert a numerical risk score into a risk level.
    """

    if risk_score >= 0.80:
        return "CRITICAL"

    elif risk_score >= 0.60:
        return "HIGH"

    elif risk_score >= 0.30:
        return "MEDIUM"

    else:
        return "LOW"