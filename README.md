## Up and running with Gitcoin Passport

This is a reference implementation to show you how to build with and use the
[Gitcoin Passport](https://passport.gitcoin.co/) to score users for your app.

Gitcoin Passport is a tool that enables developers to build Sybil resistant
applications while preserving privacy. The [Scorer
API](https://scorer.gitcoin.co/) used in this example gives developers an easy
way of retrieving a wallet's Passport score.

### Getting started

To get started, you must first create an environment variable and community
using the [Gitcoin Scorer API](https://scorer.gitcoin.co/).

You can look through this codebase to see what a simple integration with Gitcoin
Passport looks like. For more detailed information [check out the
documentation](https://docs.passport.gitcoin.co/)

### Running the app

1. Clone the repo and install the dependencies:

    ```sh
    git clone git@github.com:dabit3/nextjs-gitcoin-passport.git

    cd nextjs-gitcoin-passport

    npm install
    ```

2. Configure the environment variables for your Community ID and API key in
   a file named `.env.local`. (see example configuration at
   `.example.env.local`)

    ```
    NEXT_PUBLIC_GC_API_KEY=<your-api-key>
    NEXT_PUBLIC_GC_COMMUNITY_ID=<your-community-id>
    ```

3. Run the app

    ```sh
    npm run dev
    ```

### Next Steps

Once you've gotten a handle on how the integration works, check out some of the
following links for more information on how to integrate Gitcoin Passport into
your own application.

- [Official Documentation](https://docs.passport.gitcoin.co/)
- [Official Website](https://go.gitcoin.co/passport?utm_source=awesome-passports&utm_medium=referral&utm_content=Passport)
- [Twitter Account](https://twitter.com/gitcoinpassport)

### Getting Involved

If you're interested in getting involved, join Gitcoin's
[Discord](https://gitcoin.co/discord) and look for the [🛠passport-builders
channel](https://discord.com/channels/562828676480237578/986222591096279040).

