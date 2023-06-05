# snapdown

A command line tool to download Snapchat memories on your system.

## How To Use

Login to Snapchat <a href="https://accounts.snapchat.com/accounts/downloadmydata" target="_blank">here</a> and submit request to download your data. Snapchat will send (usually within an hour) a zip file containing all of your data they have. Extract the zip file ane locate `json/memories_history.json` file.

NOTE: Do NOT share those files with anyone. They contain highly confidential data

Open shell and change working directory to where `.json` file is located. and execute following command

```bash
npx snapdown
```

P.S. Node version > 10 must be installed on your machine.
