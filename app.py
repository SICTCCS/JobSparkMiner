from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/submit", methods=["POST"])
def submit():
    entry = {
        "email": request.form.get("email", "").strip(),
        "school": request.form.get("school"),
        "other_school": request.form.get("other_school", "").strip(),
        "shirt_size": request.form.get("shirt_size"),
        "programs": request.form.getlist("programs"),  # the 3 checked programs
        "saw_at_options_fair": request.form.get("saw_at_options_fair"),  # only sent for EVSC students
    }

    # Server-side check: every field is required (the form checks too, but never trust the browser alone)
    evsc_schools = {"Bosse High School", "Central High School", "Harrison High School",
                    "Memorial High School", "North High School", "Reitz High School", "Signature School"}
    missing = []
    if not entry["email"] or "@" not in entry["email"]:
        missing.append("email address")
    if not entry["school"]:
        missing.append("school")
    if entry["school"] == "Other" and not entry["other_school"]:
        missing.append("school name")
    if not entry["shirt_size"]:
        missing.append("shirt size")
    if len(set(entry["programs"])) != 3:
        missing.append("3 different programs")
    if entry["school"] in evsc_schools and not entry["saw_at_options_fair"]:
        missing.append("options fair answer")
    if missing:
        return jsonify(ok=False, error="Please complete: " + ", ".join(missing) + "."), 400

    # TODO: save the entry (CSV, SQLite, etc.)

    # TODO: send the confirmation email to entry["email"]
    # send_confirmation_email(entry)

    return jsonify(ok=True)


if __name__ == "__main__":
    app.run(debug=True)
