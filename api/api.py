from flask import Flask, jsonify
from flask_cors import CORS
import pymysql
import json

app = Flask(__name__)
CORS(app)

# Connect to database
try:
    print ('Connecting to database.')
    database = pymysql.connect(host='techtoolbox.tk', user='quiver', password='Ep>v{W4VAJJ]/!3}p7G^PZVtRdBD@?9!A}g`,Q]y4H%SMSE~8wx.(.2v', db='Launcher', autocommit=True, charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor)
    cursor = database.cursor(pymysql.cursors.DictCursor)
except:
    print ('Database connection failed.')
    exit()

@app.route("/packs")
def packs():
    cursor.execute('SELECT * FROM `modpacks`')
    result = cursor.fetchall()
    return jsonify(result), 200

@app.route("/pack/<id>")
def pack(id):
    cursor.execute('SELECT * FROM `modpacks` WHERE `id`=' + str(id))
    result = cursor.fetchall()
    return jsonify(result), 200
    
@app.route("/pack/<id>/manifest")
def manifest(id):
    with open('manifest/1.json') as f:
        data = json.load(f)
        return jsonify(data), 200

@app.route("/forge/<version>")
def forge(version):
    cursor.execute("SELECT `url` FROM `forge` WHERE `version`='" + version + "'")
    return jsonify(cursor.fetchone())

app.run(debug=True, port=5050)
