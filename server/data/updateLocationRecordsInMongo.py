from pymongo import MongoClient
import csv
import os

current_path = os.path.dirname(os.path.abspath(__file__))
parent_directory = os.path.dirname(current_path)
data_path = os.path.join(current_path, 'CHILD_Working_DB_v2 - Sheet1.csv')

client = MongoClient(os.getenv('MONGO_DB_URL'))
db = client['IntelligentChild']
collection = db['Locations']

# Open the CSV file for reading
with open(data_path, 'r') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    
    # Loop through each row in the CSV and insert into MongoDB
    for row in csv_reader:
        # Insert the record into the collection
        result = collection.insert_one(row)
        print('Inserted Record ID:', result.inserted_id)

# Close the MongoDB connection
client.close()