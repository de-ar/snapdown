# snapdown

A command line tool to download Snapchat memories on your system.

## How To Use

Login Snapchat [website](https://accounts.snapchat.com/accounts/downloadmydata) and submit request to download your data. Snapchat will send (usually within an hour) a zip file containing all of your data they have. Extract the zip file ane locate `json/memories_history.json` file.

Open shell and change working directory to where `.json` file is located. and execute following command

```bash
$ npx snapdown
```
