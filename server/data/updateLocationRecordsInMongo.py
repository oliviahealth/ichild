from pymongo import MongoClient
import csv
import os

current_path = os.path.dirname(os.path.abspath(__file__))
parent_directory = os.path.dirname(current_path)
data_path = os.path.join(current_path, 'IntelligentChild.Locations.csv')

client = MongoClient('mongodb+srv://Capstone:ProfWade2023@cluster0.9c4phbt.mongodb.net/?retryWrites=true&w=majority')
db = client['IntelligentChild']
collection = db['Locations']

# Open the CSV file for reading
with open(data_path, 'r') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    
    # Loop through each row in the CSV and insert into MongoDB
    for row in csv_reader:
        # Use the _id field from your data as the filter criteria
        filter_criteria = {'Name': row['Name']}
        
        # Update the existing record or insert a new one if not found
        result = collection.update_one(filter_criteria, {'$set': row}, upsert=True)
        
        print('Updated Record ID:', result.upserted_id if result.upserted_id else result.matched_count)

# Close the MongoDB connection
client.close()