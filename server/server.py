from flask import Flask, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS  # Import CORS
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MongoDB configuration
app.config[
    "MONGO_URI"
] = "mongodb+srv://app_db_user:Abcd1234@atlascluster.knvkupd.mongodb.net/visualization?retryWrites=true&w=majority"
mongo = PyMongo(app)

# Load data from jsondata.json and insert it into MongoDB when the server starts
with open("jsondata.json", "r", encoding="utf-8") as file:
    data = json.load(file)
    mongo.db.jsondata.insert_many(data)


# API endpoint to retrieve data from the "jsondata" collection
@app.route("/api/jsondata", methods=["GET"])
def get_jsondata():
    jsondata_collection = mongo.db.jsondata
    result = []
    for document in jsondata_collection.find():
        document["_id"] = str(document["_id"])  # Convert ObjectId to string
        result.append(document)
    return jsonify(result)


if __name__ == "__main__":
    port = 5000
    app.run(debug=True, port=port)
    print(f"Server running on port {port}")
