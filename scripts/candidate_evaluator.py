import sys
import json

def process_application(data):
    # Perform automated evaluation logic for JAE Global Solutions talent onboarding
    experience_years = data.get('experienceYears', 0)
    skills = data.get('skills', [])
    
    score = 50
    if int(experience_years) >= 3:
        score += 30
    if len(skills) >= 2:
        score += 20
        
    status = "RECOMMENDED" if score >= 80 else "REVIEW_REQUIRED"
    
    return {
        "candidateName": data.get("fullName", "Unknown"),
        "matchScore": score,
        "status": status,
        "recommendedRoles": ["Executive Assistant", "Operations Coordinator"]
    }

if __name__ == "__main__":
    try:
        input_data = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
        result = process_application(input_data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))