# Mediashare Phone App

## Running the Mediashare App and API

**Prerequisites:**
You will need to have Node.js, npm, yarn, and Docker installed locally

**Important**
There are two repositories for this project.
- https://github.com/bluecollardev/mediashare-app - The phone app
- https://github.com/bluecollardev/mediashare - The API for the phone app

To run the project locally, you will need to start both of them. You will also have to start the database.

### Running the Phone App in iOS Simulator

To run the project against staging environment, just start the phone app. To run the phone app, open a terminal window and run the following commands:

```shell
  yarn install # If you haven't already
  yarn app:ios:install-pods
```

if you're previously built this app, you may find that Pod install is failing. In this case run:

```shell
  yarn app:ios:refresh-pods
```

Now run this to start the Phone App in iOS Simulator:

```shell
  yarn run:ios:prod
```

### Running the Phone App against a locally running API

First, you'll need to get a database up and running. If you have docker installed, simply run `yarn compose:db && yarn seed:users` in a terminal window pointed at the project root.

Next, you'll need to start the API server. Run the following command `npm install`.
Now start the API server: `npm run api:start` or `npm run api:debug`.

To run the phone app, navigate to `./apps/mediashare`.
Then run the following commands:

```shell
  yarn install # If you haven't already
  yarn app:ios:install-pods
```

if you're previously built this app, you may find that Pod install is failing. In this case run:

```shell
  yarn app:ios:refresh-pods
```

Now run this to start the Phone App in iOS Simulator:

```shell
  yarn run:ios:local
```
  
##### Maybe is not the best way to resolve lua, but I added this line at the bottom of my .zshrc (it will work in .bashrc too!)
export PATH="$GEM_HOME/bin:$PATH"
export PATH="/usr/local/opt/lua@5.3/bin:$PATH"

##### Export Android env vars
export ANDROID_HOME=/Users/lucas/Library/Android/sdk
export ANDROID_SDK_ROOT=/Users/lucas/Library/Android/sdk
export ANDROID_AVD_HOME=/Users/lucas/.android/avd

