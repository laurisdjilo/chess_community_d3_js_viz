import sys
import xml.etree.ElementTree as ET
import pandas as pd  

file_name = sys.argv[1]
cols = [
    "country"
    , "title"
    , "rating"
    , "flag"
]
rows = []

#Parse XML file
tree = ET.parse(file_name)

root = tree.getroot()
for elem in root:
    country = elem.find("country").text
    title = elem.find("title").text
    rating = elem.find("rating").text
    flag = elem.find("flag").text
        
    rows.append({
        "country": country
        , "title": title
        , "rating": rating
        , "flag": flag
    })

df = pd.DataFrame(rows, columns = cols) 

# write dataframe to csv
df.to_csv(file_name.replace("_xml.xml", ".csv"), sep=";", index=False)