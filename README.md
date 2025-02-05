# s3s3

Another script for uploading battles and jobs from SplatNet 3 to [stat.ink](https://stat.ink/).

Since it is the third implementation after [s3s](https://github.com/frozenpandaman/s3s) and [s3si.ts](https://github.com/spacemeowx2/s3si.ts), so I will just call it s3s3 🤣.

日本語を使用される皆様へ、ハラさんの[こちらの記事](https://note.com/hara_di/n/n11145882121b)を参考にして、s3s3を設定できます。

## Usage

1. Prepare an iPhone, iPad or iPod Touch which requires iOS 15.5 or later.

2. Install [Scriptable](https://apps.apple.com/us/app/scriptable/id1405459188).

3. Install [Mudmouth](https://github.com/zhxie/Mudmouth/wiki/Join-the-Beta-Version).

4. Follow instructions of Mudmouth in app to setup VPN and trust root certificate.

5. Add [s3s3 profile of Mudmouth](mudmouth://add?name=s3s3&url=https%3A%2F%2Fapi.lp1.av5ja.srv.nintendo.net%2Fapi%2Fgraphql&preAction=1&preActionUrlScheme=com.nintendo.znca%3A%2F%2Fznca%2Fgame%2F4834290508791808&postAction=1&postActionUrlScheme=scriptable%3A%2F%2F%2Frun%2Fs3s3%3FopenEditor%3Dtrue).

   Copy and paste the following link in Safari.

   ```
   mudmouth://add?name=s3s3&url=https%3A%2F%2Fapi.lp1.av5ja.srv.nintendo.net%2Fapi%2Fgraphql&preAction=1&preActionUrlScheme=com.nintendo.znca%3A%2F%2Fznca%2Fgame%2F4834290508791808&postAction=1&postActionUrlScheme=scriptable%3A%2F%2F%2Frun%2Fs3s3%3FopenEditor%3Dtrue
   ```

6. Download and add [s3s3 script for Scriptable](https://github.com/zhxie/s3s3/releases/latest).

   After downloading the file, long press on the file in Files app and choose Share > Scriptable to install the script.

   Alternately, you can just copy the [script](/s3s3.js) directly and add a new one in Scriptable.

7. Use `s3s3` profile to capture request in Mudmouth.

8. Tap on the notification when request has been captured by Mudmouth.

9. Wait `s3s3` script to complete in Scriptable.

## License

s3s3 is licensed under [the GPLv3 License](/LICENSE).

Special thanks to [s3s](https://github.com/frozenpandaman/s3s).
