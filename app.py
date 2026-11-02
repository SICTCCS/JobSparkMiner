from flask import Flask, render_template, request, redirect, url_for
import mariadb

app = Flask(__name__)

db_config = {
    "host": "127.0.0.1",
    "user": "user",          # Change to your DB user
    "password": "user",  # Change to your DB password
    "database": "sictc_giveaway",
    "port": 3306
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit_entry():
    # Gather standard text/radio fields
    full_name = request.form.get('full_name')
    email = request.form.get('email')
    school = request.form.get('school')
    t_shirt_size = request.form.get('t_shirt_size')
    evsc_student = request.form.get('evsc_student')
    options_fair = request.form.get('options_fair')
    
    # Gather the multi-checkbox data and merge into a single text string
    selected_programs = request.form.getlist('programs[]')
    programs_string = ", ".join(selected_programs) # e.g., "Comp Sci, Cybersecurity, Engineering"

    conn = None
    try:
        conn = mariadb.connect(**db_config)
        cursor = conn.cursor()
        
        # Prepare execution statement with safe parameters
        query = """
            INSERT INTO entries 
            (full_name, email, school, t_shirt_size, interested_programs, evsc_student, seen_at_options_fair) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        data_tuple = (full_name, email, school, t_shirt_size, programs_string, evsc_student, options_fair)
        
        cursor.execute(query, data_tuple)
        conn.commit()
        
    except mariadb.Error as e:
        print(f"Error connecting to MariaDB Platform: {e}")
        return f"Database error: {e}", 500
    finally:
        if conn:
            conn.close()

    return "<h1>Success! Thank you for your entry.</h1><a href='/'>Go Back</a>"

if __name__ == '__main__':
    app.run(debug=True)