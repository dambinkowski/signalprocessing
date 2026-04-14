#!/usr/bin/env python
# coding: utf-8

# # Exercise 4 #

# Download modules, to be able to run offline

# In[1]:


get_ipython().system('pip install deepspeech ')


# In[2]:


get_ipython().system('pip install librosa --ignore-installed llvmlite')


# In[3]:


get_ipython().system('pip install numpy')


# ## Functionaly ##
# * Load models for different languages
# * Define function that allows to choose language and file that return result of word recognition system

# In[4]:


from deepspeech import Model, version
import librosa as lr
import numpy as np
import os 

# English Models 
dsEN = Model("Models/deepspeech-0.9.3-models.pbmm")
dsEN.enableExternalScorer("Models/deepspeech-0.9.3-models.scorer")

# Spanish Models 
dsES = Model("Models/output_graph_es.pbmm")
dsES.enableExternalScorer("Models/kenlm_es.scorer")

# Italian Models 
dsIT = Model("Models/output_graph_it.pbmm")
dsIT.enableExternalScorer("Models/kenlm_it.scorer")

# function takes ds model for specific language, filename and returns str from speeach analyzis 
def speechRecognition(dsLanguage, fileName):
    audio = lr.load(fileName, sr=dsLanguage.sampleRate())[0]
    audio = (audio * 32767).astype(np.int16) # scale from -1 to 1 to +/-32767
    res = dsLanguage.stt(audio)
    return res


# ## Get file names and Transcriptions - normalized ##

# In[41]:


# function that reads files names from directory 
def getFilesNamesFromDirectory(directory):
    listOfNames = []
    for fileName in sorted(os.listdir(directory)):
        file = os.path.join(directory, fileName)
        if os.path.isfile(file):
            listOfNames.append(file)
    return listOfNames

# create list of files names (with paths) for each language 
# create list of transcriptions for each sound

# English
enFiles = getFilesNamesFromDirectory('Audio_Files/EN')
enTranscriptions = ['where is terminal five', 'how do i get there', 'where is the checkin desk', 'i have lost my parents', 'please i have lost my suitcase', 'what time is my plane', 'where are the restaurants and shops']

# Spanish 
esFiles = getFilesNamesFromDirectory('Audio_Files/ES')
esTranscriptions = ['donde estan los mostradores', 'he perdido a mis padres', 'por favor he perdido mi maleta', 'a que hora es mi avion', 'donde estan los restaurantes y las tiendas']

# Italian Audio_Files/IT
itFiles = getFilesNamesFromDirectory('Audio_Files/IT')
itTranscriptions = ['dove e il bancone', 'ho perso i miei genitori', 'per favore ho perso la mia valigia', 'a che ora e il mio aereo', 'dove sono i ristoranti e i negozi' ]


# In[42]:


get_ipython().system('pip install noisereduce')


# ## Reduce noise from audio files ##
# * and create lists of audio filtered (noise reducted) files names for each language 
# * using noisereduce https://pypi.org/project/noisereduce/

# In[43]:


# Reducing Noice
from scipy.io import wavfile
import noisereduce as nr

# English 
for fileName in enFiles:
    rate, data = wavfile.read(fileName) # load data 
    reduced_noise = nr.reduce_noise(y=data, sr=rate, prop_decrease=0, stationary=True, n_std_thresh_stationary=3) # noise reduction
    tmp = "Audio_Files/Filtered/EN/" + os.path.basename(fileName) # create file name 
    wavfile.write(tmp, rate, reduced_noise) # create file 
enFilteredFiles = getFilesNamesFromDirectory('Audio_Files/Filtered/EN')
    
# Spanish 
for fileName in esFiles:
    rate, data = wavfile.read(fileName) # load data
    reduced_noise = nr.reduce_noise(y=data, sr=rate, prop_decrease=0, stationary=True, n_std_thresh_stationary=3) # noise reduction
    tmp = "Audio_Files/Filtered/ES/" + os.path.basename(fileName) # create file name 
    wavfile.write(tmp, rate, reduced_noise) # create file 
esFilteredFiles = getFilesNamesFromDirectory('Audio_Files/Filtered/ES')

# Italian
for fileName in itFiles:
    rate, data = wavfile.read(fileName) # load data 
    reduced_noise = nr.reduce_noise(y=data, sr=rate, prop_decrease=0, stationary=True, n_std_thresh_stationary=3) # noise reduction
    tmp = "Audio_Files/Filtered/IT/" + os.path.basename(fileName) # create file name 
    wavfile.write(tmp, rate, reduced_noise) # create file 
itFilteredFiles = getFilesNamesFromDirectory('Audio_Files/Filtered/IT')


# ### Adding silence in front audio files in Italian also increases accurancy of word recognition ###
# * adding 0.5 s silence to every filtered file in Italian, the app in the future development when user picks Italian input from mic should not cut out all the silence in front of it to get results similar to this working on given Italian audio clips

# In[44]:


get_ipython().system('pip install pydub')


# In[45]:


from pydub import AudioSegment

def addSilence(fileName):
    halfSecSilence = AudioSegment.silent(duration=500)
    currentAudio = AudioSegment.from_file(fileName)
    resultAudio = halfSecSilence + currentAudio
    resultAudio.export(fileName, format='wav')
    
# add silence to all Italian filtered audio files 
for fileName in itFilteredFiles:
    addSilence(fileName)


# ## Get text results  from audio files using speech recognition ##
# * result is list of texts from audios for each language

# In[53]:


# create lists of str results from speech recognition of each audiofile

# English
enFileResult = []
for fileName in enFilteredFiles:
    enFileResult.append(speechRecognition(dsEN, fileName))

# Spanish
esFileResult = []
for fileName in esFilteredFiles:
    esFileResult.append(speechRecognition(dsES, fileName))

# Italian
itFileResult = []
for fileName in itFilteredFiles:
    itFileResult.append(speechRecognition(dsIT, fileName))


# ### WER Calculator ###

# In[54]:


# copied calculate_wer function from article : 
# ref  author:  Abdou Rockikz · Ahmed Waheed Updated Jun 2023 acessed: Jul2023 https://www.thepythoncode.com/article/calculate-word-error-rate-in-python#?utm_content=cmp-true

import numpy as np

def calculate_wer(reference, hypothesis):
    # Split the reference and hypothesis sentences into words
    ref_words = reference.split()
    hyp_words = hypothesis.split()
    # Initialize a matrix with size |ref_words|+1 x |hyp_words|+1
    # The extra row and column are for the case when one of the strings is empty
    d = np.zeros((len(ref_words) + 1, len(hyp_words) + 1))
    # The number of operations for an empty hypothesis to become the reference
    # is just the number of words in the reference (i.e., deleting all words)
    for i in range(len(ref_words) + 1):
        d[i, 0] = i
    # The number of operations for an empty reference to become the hypothesis
    # is just the number of words in the hypothesis (i.e., inserting all words)
    for j in range(len(hyp_words) + 1):
        d[0, j] = j
    # Iterate over the words in the reference and hypothesis
    for i in range(1, len(ref_words) + 1):
        for j in range(1, len(hyp_words) + 1):
            # If the current words are the same, no operation is needed
            # So we just take the previous minimum number of operations
            if ref_words[i - 1] == hyp_words[j - 1]:
                d[i, j] = d[i - 1, j - 1]
            else:
                # If the words are different, we consider three operations:
                # substitution, insertion, and deletion
                # And we take the minimum of these three possibilities
                substitution = d[i - 1, j - 1] + 1
                insertion = d[i, j - 1] + 1
                deletion = d[i - 1, j] + 1
                d[i, j] = min(substitution, insertion, deletion)
    # The minimum number of operations to transform the hypothesis into the reference
    # is in the bottom-right cell of the matrix
    # We divide this by the number of words in the reference to get the WER
    wer = d[len(ref_words), len(hyp_words)] / len(ref_words)
    return wer


# ## Analyze the results compare to transcripts ## 

# In[55]:


# analyzes WER from two lists results in a list
def analyzeWERFromLists(referenceList, hypothesisList):
    result = []
    for i in range (len(referenceList)):
        result.append(calculate_wer(referenceList[i], hypothesisList[i]))
    return result
    
# English WER results
enWERResults = analyzeWERFromLists(enTranscriptions, enFileResult)


# Spanish WER results
esWERResults = analyzeWERFromLists(esTranscriptions, esFileResult)

# Italian WER results
itWERResults = analyzeWERFromLists(itTranscriptions, itFileResult)


# In[56]:


# install tabulate usefull for analyzing data and final output 
get_ipython().system('pip install tabulate')


# In[57]:


from tabulate import tabulate

# print the data for visual analysis

# English
enAnalysisTable = zip(map(os.path.basename,enFilteredFiles),enTranscriptions, enFileResult, map(lambda x:x*100,enWERResults))
print(tabulate(enAnalysisTable, headers=['English','Transcriptions', 'Result', 'WER']))
# calculate English avg for WER 
enAvgWER = int(sum(enWERResults)/len(enWERResults) * 100)
print(tabulate([['English avg WER:' ,str(enAvgWER) + '%']], tablefmt='fancy_grid'))


# Spanish
esAnalysisTable = zip(map(os.path.basename,esFilteredFiles),esTranscriptions, esFileResult, map(lambda x:int(x*100),esWERResults))
print(tabulate(esAnalysisTable, headers=['Spanish','Transcriptions', 'Result', 'WER']))
# calculate English avg for WER 
esAvgWER = int(sum(esWERResults)/len(esWERResults) * 100)
print(tabulate([['Spanish avg WER:' ,str(esAvgWER) + '%']], tablefmt='fancy_grid'))


# Italian
itAnalysisTable = zip(map(os.path.basename,itFilteredFiles),itTranscriptions, itFileResult, map(lambda x:x*100,itWERResults))
print(tabulate(itAnalysisTable, headers=['Italian','Transcriptions', 'Result', 'WER']))
# calculate English avg for WER 
itAvgWER = int(sum(itWERResults)/len(itWERResults) * 100)
print(tabulate([['Italian avg WER:' ,str(itAvgWER) + '%']], tablefmt='fancy_grid'))


# ## Output of the work ## 

# In[58]:


# create a list of languages in order English, Spanish, Italian
allLanguages = ['English']*len(enFiles) + ['Spanish']*len(enFiles) + ['Italian']*len(enFiles)

# create a list of file names in order English audio files - Spanish... - Italian... 
allFileNames = []
allFileNames.extend(map(os.path.basename,enFilteredFiles)) # add english files names
allFileNames.extend(map(os.path.basename,esFilteredFiles)) # add spanish files names
allFileNames.extend(map(os.path.basename,itFilteredFiles)) # add italian files names 

# list of result in str format with % in the end 
allWERResults = enWERResults + esWERResults + itWERResults 
for i in range (len(allWERResults)):
    allWERResults[i] = str(int(allWERResults[i]*100)) + '%'

outputTable = zip(allLanguages, allFileNames, allWERResults)
print(tabulate(outputTable, headers=['Language','File','WER'], tablefmt='fancy_grid'))

