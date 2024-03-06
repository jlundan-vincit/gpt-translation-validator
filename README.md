# openai-translation-validator
This is a prototype repository which uses OpenAI GPT-4 endpoint to validate translations. In the prototype, 
the translations were provided in Microsoft Excel file (.xlsx). The prototype code reads the translations from the 
Excel sheet using `xslsx` library and then uses OpenAI GPT-4 to validate the translations. Please see
```
example-script-validate-english-german.sh
```
for an example invocation. The shell script spawns multiple processes to validate translations in parallel, each given 
a "chunk" of translations to validate from the source Excel file. 

This prototype is not meant for fully production use, but rather to demonstrate how we used the OpenAI GPT-4 endpoint to
check translations. The codebase is rather small, so hopefully it should be easy to understand without example data
(which we currently do not share). Please contact Juha Lundan on Vincit Slack if you have any questions or would like 
to discuss the prototype further.