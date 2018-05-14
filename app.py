# import necessary libraries
from flask import (Flask, render_template, jsonify, request, redirect)
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
import pandas as pd

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Connect to existing database
#################################################

engine = create_engine("sqlite:///DataSets/belly_button_biodiversity.sqlite", echo=False)
Base = automap_base()
Base.prepare(engine, reflect=True)
Base.classes.keys()
OTU = Base.classes.otu
Samples = Base.classes.samples
SamplesMetadata = Base.classes.samples_metadata
session = Session(engine)

#return(print(Samples))

# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")

# Query the database and send the jsonified results
@app.route("/names")
def names():

    samples_cols_list = Samples.__table__.columns.keys()
    sample_list = samples_cols_list[1:]
    return(jsonify(sample_list))    

@app.route("/otu")
def otu():

    otu_desc_col = session.query(OTU.lowest_taxonomic_unit_found).all()
    otu_desc = [i for i, in otu_desc_col]
    return(jsonify(otu_desc)) 

@app.route("/metadata/<sample>")
def metadata(sample):

    results = session.query(SamplesMetadata).filter(SamplesMetadata.SAMPLEID == sample[3:]).all()
    columns = {'AGE', 'BBTYPE', 'ETHNICITY', 'GENDER', 'LOCATION', 'SAMPLEID'}
    sample_dict = {}
    for j,k in results[0].__dict__.items():
        if j in columns: sample_dict[j] = k
    return jsonify(sample_dict)

@app.route("/wfreq/<sample>")
def wfreq(sample):

    results = session.query(SamplesMetadata.WFREQ).filter(SamplesMetadata.SAMPLEID == sample[3:]).all()
    return jsonify(results[0][0])

@app.route("/samples/<sample>")
def samples(sample):

    all = pd.read_sql(session.query(Samples).statement, engine)
    data = all[['otu_id', sample]]
    data = data.loc[data[sample] > 0]
    data.columns = ['otu_id','sample_values']
    data = data.sort_values('sample_values', ascending=False)
    otu_ids = []
    sample_values = []

    for i in range(0, len(data)):
        otu_ids.append(str(data['otu_id'].iloc[i]))
        sample_values.append(str(data['sample_values'].iloc[i]))
        sample_dict = {
        "otu_id": otu_ids,
        "sample_values": sample_values
        }    
    return(jsonify(sample_dict))

if __name__ == "__main__":
    app.run(debug=True)