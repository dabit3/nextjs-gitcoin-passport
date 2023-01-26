## Up and running with Gitcoin Passport

This is a reference architecture to show you how to build with and use the Gitcoin Passport APIs to score users for your app.

### Getting started

To get started, you must first create an environment variable and community using the [Gitcoin Scorer API](https://scorer.gitcoin.co/).

### Running the app

1. Clone the repo and install the dependencies:

```sh
git clone git@github.com:dabit3/nextjs-gitcoin-passport.git

cd nextjs-gitcoin-passport

npm install
```

2. Configure the environment variables for your community ID and API key in a file named `.env.local`. (see example configuration at `.example.env.local`)

```
NEXT_PUBLIC_GC_API_KEY=<your-api-key>
NEXT_PUBLIC_GC_COMMUNITY_ID=<your-community-id>
```

3. Run the app

```sh
npm run dev
```