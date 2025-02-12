// Configuration. You do not need to configure them unless you want to overwrite saved configuration.
// Your stat.ink API key. You can get your API key in https://stat.ink/profile.
let API_KEY = "";
// Language used in SplatNet 3.
// Available values for the option are de-DE, en-GB, en-US, es-ES, es-MX, fr-CA, fr-FR, it-IT, ja-JP, ko-KR, nl-NL, ru-RU, zh-CN and zh-TW.
let LANG = "";
// Your bullet token.
let BULLET_TOKEN = "";
// Your cookie. This field is optional but recommended to fill.
let COOKIE = "";
// Your user agent. This field is optional but recommended to fill.
let USER_AGENT = "";

// Debug configuration. DO NOT EDIT unless you know what you are doing.
// Run in the test mode.
const TEST_MODE = false;

// Check update.
// HACK: remain A_VERSION for v0.0.1 compatibility.
const A_VERSION = "0.2.3";
console.log(`s3s3 v${A_VERSION}`);
const updated = await checkUpdate();
if (!updated) {
  return;
}

// Prepare and configuration check.
if (API_KEY) {
  console.log("Use manually set bullet token");
  Keychain.set("apiKey", API_KEY);
} else if (Keychain.contains("apiKey")) {
  console.log("Use API key from keychain");
  API_KEY = Keychain.get("apiKey");
} else {
  const alert = new Alert();
  alert.title = "Input your stat.ink API Key";
  alert.message = "You can get your API key in https://stat.ink/profile.";
  alert.addTextField();
  alert.addCancelAction("OK");
  await alert.present();
  API_KEY = alert.textFieldValue(0);
  Keychain.set("apiKey", API_KEY);
}
if (API_KEY.length !== 43) {
  Keychain.remove("apiKey");

  const alert = new Alert();
  alert.title = "Invalid stat.ink API Key";
  alert.message = "Your stat.ink API key is invalid. You can get your API key in https://stat.ink/profile.";
  alert.addAction("Open stat.ink Profile");
  alert.addCancelAction("Quit");
  const res = await alert.present();
  if (res === 0) {
    await Safari.openInApp("https://stat.ink/profile");
  }
  return;
}
if (LANG) {
  console.log("Use manually set language");
  Keychain.set("lang", LANG);
} else if (Keychain.contains("lang")) {
  console.log("Use language from keychain");
  LANG = Keychain.get("lang");
} else {
  const alert = new Alert();
  alert.title = "Select Your Language";
  alert.addAction("Deutsch");
  alert.addAction("English (UK)");
  alert.addAction("English (United States)");
  alert.addAction("Español");
  alert.addAction("Español (México)");
  alert.addAction("Français (Canada)");
  alert.addAction("Français (France)");
  alert.addAction("Italiano");
  alert.addAction("日本語");
  alert.addAction("한국어");
  alert.addAction("Nederlands");
  alert.addAction("Русский язык");
  alert.addAction("简体中文");
  alert.addAction("繁體中文");
  const res = await alert.present();
  switch (res) {
    case 0:
      LANG = "de-DE";
      break;
    case 1:
      LANG = "en-GB";
      break;
    case 2:
      LANG = "en-US";
      break;
    case 3:
      LANG = "es-ES";
      break;
    case 4:
      LANG = "es-MX";
      break;
    case 5:
      LANG = "fr-CA";
      break;
    case 6:
      LANG = "fr-FR";
      break;
    case 7:
      LANG = "it-IT";
      break;
    case 8:
      LANG = "ja-JP";
      break;
    case 9:
      LANG = "ko-KR";
      break;
    case 10:
      LANG = "nl-NL";
      break;
    case 11:
      LANG = "ru-RU";
      break;
    case 12:
      LANG = "zh-CN";
      break;
    case 13:
      LANG = "zh-TW";
      break;
  }
  if (LANG) {
    Keychain.set("lang", LANG);
  }
}
if (!["de-DE", "en-GB", "en-US", "es-ES", "es-MX", "fr-CA", "fr-FR", "it-IT", "ja-JP", "ko-KR", "nl-NL", "ru-RU", "zh-CN", "zh-TW"].includes(LANG)) {
  Keychain.remove("lang");

  const alert = new Alert();
  alert.title = "Invalid Language";
  alert.message = "Your language is invalid. Please check your configuration.";
  alert.addCancelAction("Quit");
  await alert.present();
  return;
}
if (BULLET_TOKEN) {
  console.log("Use manually set bullet token");
} else if (args.queryParameters["requestHeaders"]) {
  console.log("Use bullet token from query");
  let b64Str = args.queryParameters["requestHeaders"].replaceAll("-", "+").replaceAll("_", "/");
  b64Str = b64Str.padEnd(b64Str.length + (4 - (b64Str.length % 4 || 4)), "=");
  const data = Data.fromBase64String(b64Str);
  const str = data.toRawString() + "\r\n";
  const re = /Authorization: Bearer (.*)\r\n/g;
  const match = re.exec(str);
  BULLET_TOKEN = match?.[1] ?? "";
  Keychain.set("bulletToken", BULLET_TOKEN);
} else if (Keychain.contains("bulletToken")) {
  console.log("Use bullet token from keychain");
  BULLET_TOKEN = Keychain.get("bulletToken");
}
if (!BULLET_TOKEN) {
  const alert = new Alert();
  alert.title = "Invalid Bullet Token";
  alert.message = "Your bullet token is invalid. Please use s3s3 from Mudmouth. See https://github.com/zhxie/s3s3 for more.";
  alert.addAction("See Instructions");
  alert.addCancelAction("Quit");
  const res = await alert.present();
  if (res === 0) {
    await Safari.openInApp("https://github.com/zhxie/s3s3?tab=readme-ov-file#usage");
  }
  return;
}
if (COOKIE) {
  console.log("Use manually set cookie");
} else if (args.queryParameters["requestHeaders"]) {
  console.log("Use cookie from query");
  let b64Str = args.queryParameters["requestHeaders"].replaceAll("-", "+").replaceAll("_", "/");
  b64Str = b64Str.padEnd(b64Str.length + (4 - (b64Str.length % 4 || 4)), "=");
  const data = Data.fromBase64String(b64Str);
  const str = data.toRawString() + "\r\n";
  const re = /Cookie: (.*)\r\n/g;
  const match = re.exec(str);
  COOKIE = match?.[1] ?? "";
  Keychain.set("cookie", COOKIE);
} else if (Keychain.contains("cookie")) {
  console.log("Use cookie from keychain");
  COOKIE = Keychain.get("cookie");
}
if (USER_AGENT) {
  console.log("Use manually set user agent");
} else if (args.queryParameters["requestHeaders"]) {
  console.log("Use user agent from query");
  let b64Str = args.queryParameters["requestHeaders"].replaceAll("-", "+").replaceAll("_", "/");
  b64Str = b64Str.padEnd(b64Str.length + (4 - (b64Str.length % 4 || 4)), "=");
  const data = Data.fromBase64String(b64Str);
  const str = data.toRawString() + "\r\n";
  const re = /User-Agent: (.*)\r\n/g;
  const match = re.exec(str);
  USER_AGENT = match?.[1] ?? "";
  Keychain.set("userAgent", USER_AGENT);
} else if (Keychain.contains("userAgent")) {
  console.log("Use user agent from keychain");
  USER_AGENT = Keychain.get("userAgent");
}
if (!COOKIE || !USER_AGENT) {
  const alert = new Alert();
  alert.title = "Empty Cookie or User Agent";
  alert.message = "Your cookie or user agent is empty. Although these fields are optional, ignoring them may lead to potential security risks. \n\nIf you are using s3s3 from Mudmouth, it is likely that Mudmouth captures requests from widgets of Nintendo Switch Online instead of the app itself. You may continue to use s3s3 or try to capture requests again in Mudmouth.";
  alert.addDestructiveAction("Continue");
  alert.addCancelAction("Quit");
  const res = await alert.present();
  if (res === -1) {
    return;
  }
}

// Check SplatNet version.
const SPLATNET_VERSION = await checkSplatnetVersion();
if (SPLATNET_VERSION.length === 0) {
  return;
}

// Fetch uploaded battles.
const uploadedBattleIds = await getUploaded("s3s");
if (uploadedBattleIds === undefined) {
  return;
}

// Fetch latest battles.
// TODO: fetch the latest 50 battles in each modes.
let battleIndex = 0;
const battleData = await fetchGraphQl("b24d22fd6cb251c515c2b90044039698aa27bc1fab15801d83014d919cd45780", {});
if (battleData === undefined) {
  return;
}
const battleGroups = battleData["latestBattleHistories"]["historyGroups"]["nodes"];
const battleTotal = battleGroups.reduce((prev, cur) => prev + cur["historyDetails"]["nodes"].length, 0);
for (const group of battleGroups) {
  const battleNodes = group["historyDetails"]["nodes"];
  for (const node of battleNodes) {
    battleIndex++;
    const id = node["id"];
    console.log(`[${battleIndex}/${battleTotal}] Battle ID: ${id}`);
    try {
      const uuid = generateUuidV5("b3a2dbf5-2c09-4792-b78c-00b548b70aeb", Data.fromBase64String(id).toRawString().slice(-52));
      if (uploadedBattleIds.includes(uuid)) {
        console.log("Uploaded");
        continue;
      }

      const data = await fetchGraphQl("20f88b10d0b1d264fcb2163b0866de26bbf6f2b362f397a0258a75b7fa900943", { vsResultId: id }, true);
      if (data === undefined) {
        return;
      }

      // Format payload for battle.
      const battle = data["vsHistoryDetail"];
      const payload = {};

      // UUID.
      payload["uuid"] = uuid;

      // Mode.
      const mode = battle["vsMode"]["mode"];
      switch (mode) {
        case "REGULAR":
          payload["lobby"] = "regular";
          break;
        case "BANKARA":
          switch (battle["bankaraMatch"]["mode"]) {
            case "OPEN":
              payload["lobby"] = "bankara_open";
              break;
            case "CHALLENGE":
              payload["lobby"] = "bankara_challenge";
              break;
          }
          break;
        case "X_MATCH":
          payload["lobby"] = "xmatch";
          break;
        case "LEAGUE":
          payload["lobby"] = "event";
          break;
        case "PRIVATE":
          payload["lobby"] = "private";
          break;
        case "FEST":
          switch (decodeBase64Index(battle["vsMode"]["id"])) {
            case "6":
            case "8":
              payload["lobby"] = "splatfest_open";
              break;
            case "7":
              payload["lobby"] = "splatfest_challenge";
              break;
          }
          break;
      }

      // Rule.
      const rule = battle["vsRule"]["rule"];
      switch (rule) {
        case "TURF_WAR":
          payload["rule"] = "nawabari";
          break;
        case "AREA":
          payload["rule"] = "area";
          break;
        case "LOFT":
          payload["rule"] = "yagura";
          break;
        case "GOAL":
          payload["rule"] = "hoko";
          break;
        case "CLAM":
          payload["rule"] = "asari";
          break;
        case "TRI_COLOR":
          payload["rule"] = "tricolor";
          break;
      }

      // Stage.
      payload["stage"] = decodeBase64Index(battle["vsStage"]["id"]);

      // Player and teams.
      for (let i = 0; i < battle["myTeam"]["players"].length; i++) {
        const player = battle["myTeam"]["players"][i];
        if (player["isMyself"]) {
          payload["weapon"] = decodeBase64Index(player["weapon"]["id"]);
          payload["inked"] = player["paint"];
          payload["species"] = player["species"].toLowerCase();
          payload["rank_in_team"] = i + 1;
          if (player["result"]) {
            payload["kill_or_assist"] = player["result"]["kill"];
            payload["assist"] = player["result"]["assist"];
            payload["kill"] = payload["kill_or_assist"] - payload["assist"];
            payload["death"] = player["result"]["death"];
            payload["special"] = player["result"]["special"];
            payload["signal"] = player["result"]["noroshiTry"];
            break;
          }
        }
      }
      payload["our_team_inked"] = battle["myTeam"]["players"].reduce((prev, cur) => prev + cur["paint"], 0);
      payload["their_team_inked"] = battle["otherTeams"][0]["players"].reduce((prev, cur) => prev + cur["paint"], 0);
      if (battle["otherTeams"].length > 1) {
        payload["third_team_inked"] = battle["otherTeams"][1]["players"].reduce((prev, cur) => prev + cur["paint"], 0);
      }

      // Result.
      switch (battle["judgement"]) {
        case "WIN":
          payload["result"] = "win";
          break;
        case "LOSE":
        case "DEEMED_LOSE":
          payload["result"] = "lose";
          break;
        case "EXEMPTED_LOSE":
          payload["result"] = "exempted_lose";
          break;
        case "DRAW":
          payload["result"] = "draw";
          break;
      }

      // Basic info.
      switch (rule) {
        case "TURF_WAR":
        case "TRI_COLOR":
          try {
            payload["our_team_percent"] = battle["myTeam"]["result"]["paintRatio"] * 100;
            payload["their_team_percent"] = battle["otherTeams"][0]["result"]["paintRatio"] * 100;
            payload["third_team_percent"] = battle["otherTeams"][1]["result"]["paintRatio"] * 100;
          } catch {}
          break;
        default:
          try {
            payload["knockout"] = !battle["knockout"] || battle["knockout"] == "NEITHER" ? "no" : "yes";
            payload["our_team_count"] = battle["myTeam"]["result"]["score"];
            payload["their_team_count"] = battle["otherTeams"][0]["result"]["score"];
          } catch {}
          break;
      }

      // Times.
      payload["start_at"] = Math.floor(new Date(battle["playedTime"]).valueOf() / 1000);
      payload["end_at"] = payload["start_at"] + battle["duration"];

      // Colors.
      payload["our_team_color"] = convertColor(battle["myTeam"]["color"]);
      payload["their_team_color"] = convertColor(battle["otherTeams"][0]["color"]);
      if (rule === "TRI_COLOR") {
        payload["third_team_color"] = convertColor(battle["otherTeams"][1]["color"]);
      }

      // Players.
      const teams = [battle["myTeam"], ...battle["otherTeams"]];
      for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        const teamPayload = [];
        for (const player of team["players"]) {
          playerPayload = {};
          playerPayload["me"] = player["isMyself"] ? "yes" : "no";
          playerPayload["name"] = player["name"];
          if (player["nameId"]) {
            playerPayload["number"] = player["nameId"];
          }
          playerPayload["splashtag_title"] = player["byname"];
          playerPayload["weapon"] = decodeBase64Index(player["weapon"]["id"]);
          playerPayload["inked"] = player["paint"];
          playerPayload["species"] = player["species"].toLowerCase();
          playerPayload["rank_in_team"] = i + 1;

          if (player["crown"]) {
            playerPayload["crown_type"] = "x";
          }
          switch (player["festDragonCert"]) {
            case "DRAGON":
              playerPayload["crown_type"] = "100x";
              break;
            case "DOUBLE_DRAGON":
              playerPayload["crown_type"] = "333x";
              break;
          }

          if (player["result"]) {
            playerPayload["kill_or_assist"] = player["result"]["kill"];
            playerPayload["assist"] = player["result"]["assist"];
            playerPayload["kill"] = playerPayload["kill_or_assist"] - playerPayload["assist"];
            playerPayload["death"] = player["result"]["death"];
            playerPayload["special"] = player["result"]["special"];
            playerPayload["signal"] = player["result"]["noroshiTry"];
            playerPayload["disconnected"] = "no";
            playerPayload["crown"] = player["crown"] ? "yes" : "no";
            playerPayload["gears"] = {};

            const Gears = { headGear: "headgear", clothingGear: "clothing", shoesGear: "shoes" };
            for (const key of Object.keys(Gears)) {
              const gearPayload = { primary_ability: translateGearAbility(player[key]["primaryGearPower"]["image"]["url"]), secondary_abilities: [] };
              for (const ability of player[key]["additionalGearPowers"]) {
                gearPayload.secondary_abilities.push(translateGearAbility(ability["image"]["url"]));
              }
              playerPayload["gears"][Gears[key]] = gearPayload;
            }
          } else {
            playerPayload["disconnected"] = "yes";
          }

          teamPayload.push(playerPayload);
        }

        switch (i) {
          case 0:
            payload["our_team_players"] = teamPayload;
            break;
          case 1:
            payload["their_team_players"] = teamPayload;
            break;
          case 2:
            payload["third_team_players"] = teamPayload;
            break;
        }
      }

      // Splatfest Battles.
      if (mode === "FEST") {
        payload["our_team_theme"] = battle["myTeam"]["festTeamName"];
        payload["their_team_theme"] = battle["otherTeams"][0]["festTeamName"];
        switch (battle["festMatch"]["dragonMatchType"]) {
          case "DECUPLE":
            payload["fest_dragon"] = "10x";
            break;
          case "DRAGON":
            payload["fest_dragon"] = "100x";
            break;
          case "DOUBLE_DRAGON":
            payload["fest_dragon"] = "333x";
            break;
          case "CONCH_SHELL_SCRAMBLE":
            payload["conch_clash"] = "1x";
            break;
          case "CONCH_SHELL_SCRAMBLE_10":
            payload["conch_clash"] = "10x";
            break;
          case "CONCH_SHELL_SCRAMBLE_33":
            payload["conch_clash"] = "33x";
            break;
        }
        payload["clout_change"] = battle["festMatch"]["contribution"];
        payload["fest_power"] = battle["festMatch"]["myFestPower"];

        if (rule === "TRI_COLOR") {
          payload["third_team_theme"] = battle["otherTeams"][1]["festTeamName"];

          payload["our_team_role"] = battle["myTeam"]["tricolorRole"] === "DEFENSE" ? "defender" : "attacker";
          payload["their_team_role"] = battle["otherTeams"][0]["tricolorRole"] === "DEFENSE" ? "defender" : "attacker";
          payload["third_team_role"] = battle["otherTeams"][1]["tricolorRole"] === "DEFENSE" ? "defender" : "attacker";
        }
      }

      // Anarchy Battles.
      // TODO: fetch overview.
      if (mode === "BANKARA") {
        payload["rank_exp_change"] = battle["bankaraMatch"]["earnedUdemaePoint"];

        try {
          payload["bankara_power_after"] = battle["bankaraMatch"]["bankaraPower"]["power"];
        } catch {}
      }

      // X Battles.
      // TODO: fetch overview.
      if (mode === "X_MATCH") {
        if (battle["xMatch"]["lastXPower"]) {
          payload["x_power_before"] = battle["xMatch"]["lastXPower"];
        }
      }

      // Challenges.
      if (mode === "LEAGUE") {
        payload["event"] = battle["leagueMatch"]["leagueMatchEvent"]["id"];
        payload["event_power"] = battle["leagueMatch"]["myLeaguePower"];
      }

      // Medals.
      const medals = [];
      for (const medal of battle["awards"]) {
        medals.push(medal["name"]);
      }
      payload["medals"] = medals;

      payload["automated"] = "yes";
      payload["splatnet_json"] = JSON.stringify(battle);

      // Upload to stat.ink.
      const url = await upload("battle", id, payload);
      if (url) {
        scheduleNotification(url);
      }
    } catch (e) {
      const alert = new Alert();
      alert.title = "Unrecognized Data";
      alert.message = `s3s3 cannot parse the data of ${id}. Please file a bug on https://github.com/zhxie/s3s3/issues. \n\nYou can also open the result in SplatNet 3 to see if it loads correctly. If it does not display properly, the issue might be with SplatNet 3. \n\n${e}`;
      alert.addAction("Continue");
      alert.addAction("Open in SplatNet 3");
      alert.addCancelAction("Quit");
      const res = await alert.present();
      switch (res) {
        case 1:
          await Safari.open(`com.nintendo.znca://znca/game/4834290508791808?p=/history/detail/${id}`);
          return;
        case -1:
          return;
      }
    }
  }
}

// Fetch uploaded jobs.
const uploadedJobIds = await getUploaded("salmon");
if (uploadedJobIds === undefined) {
  return;
}

// Fetch latest jobs.
let jobIndex = 0;
const jobData = await fetchGraphQl("e11a8cf2c3de7348495dea5cdcaa25e0c153541c4ed63f044b6c174bc5b703df", {});
if (jobData === undefined) {
  return;
}
const jobGroups = jobData["coopResult"]["historyGroups"]["nodes"];
const jobTotal = jobGroups.reduce((prev, cur) => prev + cur["historyDetails"]["nodes"].length, 0);
for (const group of jobGroups) {
  const jobNodes = group["historyDetails"]["nodes"];
  for (const node of jobNodes) {
    jobIndex++;
    const id = node["id"];
    console.log(`[${jobIndex}/${jobTotal}] Job ID: ${id}`);
    try {
      const uuid = generateUuidV5("f1911910-605e-11ed-a622-7085c2057a9d", Data.fromBase64String(id).toRawString());
      if (uploadedJobIds.includes(uuid)) {
        console.log("Uploaded");
        continue;
      }

      const data = await fetchGraphQl("f2d55873a9281213ae27edc171e2b19131b3021a2ae263757543cdd3bf015cc8", { coopHistoryDetailId: id }, true);
      if (data === undefined) {
        return;
      }

      // Format payload for job.
      const job = data["coopHistoryDetail"];
      const payload = {};

      // UUID.
      payload["uuid"] = uuid;

      // Rule.
      const rule = job["rule"];
      switch (rule) {
        case "PRIVATE_CUSTOM":
        case "PRIVATE_SCENARIO":
          payload["private"] = "yes";
          break;
        default:
          if (job["jobPoint"] === null) {
            payload["private"] = "yes";
          } else {
            payload["private"] = "no";
          }
          break;
      }
      payload["big_run"] = rule === "BIG_RUN" ? "yes" : "no";
      payload["eggstra_work"] = rule === "TEAM_CONTEST" ? "yes" : "no";

      // Stage.
      payload["stage"] = decodeBase64Index(job["coopStage"]["id"]);

      // Basic info.
      if (rule !== "TEAM_CONTEST") {
        payload["danger_rate"] = job["dangerRate"] * 100;
      }
      payload["king_smell"] = job["smellMeter"];
      payload["job_score"] = job["jobScore"];
      payload["job_rate"] = job["jobRate"];
      payload["job_bonus"] = job["jobBonus"];
      payload["job_point"] = job["jobPoint"];

      // Wave.
      const wavesCleared = job["resultWave"] - 1;
      const maxWaves = rule === "TEAM_CONTEST" ? 5 : 3;
      payload["clear_waves"] = wavesCleared === -1 ? maxWaves : wavesCleared;
      if (payload["clear_waves"] < 0) {
        payload["clear_waves"] = null;
      } else if (payload["clear_waves"] !== maxWaves) {
        const lastWave = job["waveResults"][payload["clear_waves"]];
        if (lastWave["teamDeliverCount"] >= lastWave["deliverNorm"]) {
          payload["fail_reason"] = "wipe_out";
        }
      }

      // Xtrawave.
      if (job["bossResult"]) {
        payload["king_salmonid"] = decodeBase64Index(job["bossResult"]["boss"]["id"]);
        payload["clear_extra"] = job["bossResult"]["hasDefeatBoss"] ? "yes" : "no";
      }

      // Title.
      if (payload["private"] !== "yes" && rule !== "TEAM_CONTEST") {
        payload["title_after"] = decodeBase64Index(job["afterGrade"]["id"]);
        payload["title_exp_after"] = job["afterGradePoint"];
      }

      // Eggs.
      let goldenEggs = 0;
      let powerEggs = job["myResult"]["deliverCount"];
      for (const player of job["memberResults"]) {
        powerEggs += player["deliverCount"];
      }
      for (const wave of job["waveResults"]) {
        goldenEggs += wave["teamDeliverCount"] ?? 0;
      }
      payload["golden_eggs"] = goldenEggs;
      payload["power_eggs"] = powerEggs;

      // Scales.
      if (job["scale"]) {
        payload["gold_scale"] = job["scale"]["gold"];
        payload["silver_scale"] = job["scale"]["silver"];
        payload["bronze_scale"] = job["scale"]["bronze"];
      }

      // Players.
      payload["players"] = [];
      const memberResults = [job["myResult"], ...job["memberResults"]];
      for (let i = 0; i < memberResults.length; i++) {
        const player = memberResults[i];
        const playerPayload = {};
        playerPayload["me"] = i === 0 ? "yes" : "no";
        playerPayload["name"] = player["player"]["name"];
        playerPayload["number"] = player["player"]["nameId"];
        playerPayload["splashtag_title"] = player["player"]["byname"];
        playerPayload["golden_eggs"] = player["goldenDeliverCount"];
        playerPayload["golden_assist"] = player["goldenAssistCount"];
        playerPayload["power_eggs"] = player["deliverCount"];
        playerPayload["rescue"] = player["rescueCount"];
        playerPayload["rescued"] = player["rescuedCount"];
        playerPayload["defeat_boss"] = player["defeatEnemyCount"];
        playerPayload["species"] = player["player"]["species"].toLowerCase();

        if (!playerPayload["golden_eggs"] && !playerPayload["power_eggs"] && !playerPayload["rescue"] && !playerPayload["rescued"] && !playerPayload["defeat_boss"]) {
          playerPayload["disconnected"] = "yes";
        } else {
          playerPayload["disconnected"] = "no";
        }

        playerPayload["uniform"] = decodeBase64Index(player["player"]["uniform"]["id"]);

        if (player["specialWeapon"]) {
          const SpecialWeapons = {
            20006: "nicedama",
            20007: "hopsonar",
            20009: "megaphone51",
            20010: "jetpack",
            20012: "kanitank",
            20013: "sameride",
            20014: "tripletornado",
            20017: "teioika",
            20018: "ultra_chakuchi",
          };
          const specialId = player["specialWeapon"]["weaponId"];
          playerPayload["special"] = SpecialWeapons[specialId];
        }

        playerPayload["weapons"] = player["weapons"].map((weapon) => translateWeapon(weapon["image"]["url"]));
        for (const weapon of player["weapons"]) {
          if (weapon["image"]["url"].includes("473fffb2442075078d8bb7125744905abdeae651b6a5b7453ae295582e45f7d1")) {
          }
        }

        payload["players"].push(playerPayload);
      }

      // Waves.
      payload["waves"] = [];
      for (let i = 0; i < job["waveResults"].length; i++) {
        const wave = job["waveResults"][i];
        const wavePayload = {};
        switch (wave["waterLevel"]) {
          case 0:
            wavePayload["tide"] = "low";
            break;
          case 1:
            wavePayload["tide"] = "normal";
            break;
          case 2:
            wavePayload["tide"] = "high";
            break;
        }
        wavePayload["golden_quota"] = wave["deliverNorm"];
        wavePayload["golden_delivered"] = wave["teamDeliverCount"];
        wavePayload["golden_appearances"] = wave["goldenPopCount"];

        if (rule === "TEAM_CONTEST") {
          let dangerRate = 60;
          if (i > 0) {
            const prev = payload["waves"][payload["waves"].length - 1];
            dangerRate = prev["danger_rate"];
            const quota = prev["golden_quota"];
            const delivered = prev["golden_delivered"];
            switch (payload["players"].length) {
              case 1:
                if (delivered >= quota * 2) {
                  dangerRate += 10;
                } else if (delivered >= quota * 1.5) {
                  dangerRate += 5;
                }
                break;
              case 2:
                if (delivered >= quota * 2) {
                  dangerRate += 20;
                } else if (delivered >= quota * 1.5) {
                  dangerRate += 10;
                }
                break;
              case 3:
                if (delivered >= quota * 2) {
                  dangerRate += 40;
                } else if (delivered >= quota * 1.5) {
                  dangerRate += 20;
                }
                break;
              case 4:
                if (delivered >= quota * 2) {
                  dangerRate += 60;
                } else if (delivered >= quota * 1.5) {
                  dangerRate += 30;
                }
                break;
            }
            wavePayload["danger_rate"] = dangerRate;
          }
        }

        if (wave["eventWave"]) {
          const Events = { 1: "rush", 2: "goldie_seeking", 3: "the_griller", 4: "the_mothership", 5: "fog", 6: "cohock_charge", 7: "giant_tornado", 8: "mudmouth_eruption" };
          const eventId = decodeBase64Index(wave["eventWave"]["id"]);
          wavePayload["event"] = Events[eventId];
        }

        const SpecialWeapons = {
          20006: "nicedama",
          20007: "hopsonar",
          20009: "megaphone51",
          20010: "jetpack",
          20012: "kanitank",
          20013: "sameride",
          20014: "tripletornado",
          20017: "teioika",
          20018: "ultra_chakuchi",
        };
        const SpecialWeaponUsage = {
          nicedama: 0,
          hopsonar: 0,
          megaphone51: 0,
          jetpack: 0,
          kanitank: 0,
          sameride: 0,
          tripletornado: 0,
          teioika: 0,
          ultra_chakuchi: 0,
        };
        for (const specialWeapon of wave["specialWeapons"]) {
          const id = decodeBase64Index(specialWeapon["id"]);
          const key = SpecialWeapons[id];
          SpecialWeaponUsage[key]++;
        }
        wavePayload["special_uses"] = SpecialWeaponUsage;

        payload["waves"].push(wavePayload);
      }

      // Boss Salmonid.
      const BossSalmonids = {
        4: "bakudan",
        5: "katapad",
        6: "teppan",
        7: "hebi",
        8: "tower",
        9: "mogura",
        10: "koumori",
        11: "hashira",
        12: "diver",
        13: "tekkyu",
        14: "nabebuta",
        15: "kin_shake",
        17: "grill",
        20: "doro_shake",
      };
      payload["bosses"] = {};
      for (const result of job["enemyResults"]) {
        const id = decodeBase64Index(result["enemy"]["id"]);
        const key = BossSalmonids[id];
        payload["bosses"][key] = {
          appearances: result["popCount"],
          defeated: result["teamDefeatCount"],
          defeated_by_me: result["defeatCount"],
        };
      }

      // Time.
      payload["start_at"] = Math.floor(new Date(job["playedTime"]).valueOf() / 1000);

      payload["automated"] = "yes";
      payload["splatnet_json"] = JSON.stringify(job);

      // Upload to stat.ink.
      const url = await upload("salmon", id, payload);
      if (url) {
        scheduleNotification(url);
      }
    } catch (e) {
      const alert = new Alert();
      alert.title = "Unrecognized Data";
      // TODO: we cannot open a coop in SplatNet 3 using URL Scheme.
      alert.message = `s3s3 cannot parse the data of ${id}. Please file a bug on https://github.com/zhxie/s3s3/issues. \n\nYou can also open the result in SplatNet 3 to see if it loads correctly. If it does not display properly, the issue might be with SplatNet 3. \n\n${e}`;
      alert.addAction("Continue");
      alert.addCancelAction("Quit");
      const res = await alert.present();
      if (res === -1) {
        return;
      }
    }
  }
}

// Alert on completion.
const alert = new Alert();
alert.title = "Uploaded Successfully";
alert.message = "s3s3 has uploaded your results to stat.ink.";
alert.addAction("Open stat.ink");
alert.addCancelAction("OK");
const res = await alert.present();
if (res === 0) {
  await Safari.openInApp("https://stat.ink/");
}

async function checkUpdate() {
  const req = new Request("https://api.github.com/repos/zhxie/s3s3/releases");
  try {
    const json = await req.loadJSON();
    const version = json[0]["tag_name"].slice(1);
    console.log(`Online s3s3 version: ${version}`);
    if (version !== A_VERSION) {
      const alert = new Alert();
      alert.title = "New Version Available";
      alert.message = `There is a new version (${version}) of s3s3. Please update s3s3 to the latest version as soon as possible.`;
      alert.addAction("Update Now");
      alert.addCancelAction("OK");
      const res = await alert.present();
      if (res === 0) {
        await Safari.open("https://github.com/zhxie/s3s3/releases/latest");
        return false;
      }
    }
  } catch {}
  return true;
}

async function checkSplatnetVersion() {
  const req = new Request("https://cdn.jsdelivr.net/gh/nintendoapis/nintendo-app-versions/data/splatnet3-app.json");
  let version = "";
  try {
    const json = await req.loadJSON();
    version = json["web_app_ver"] ?? "";
    console.log(`SplatNet version: ${version}`);
    return version;
  } catch {}

  if (version.length === 0) {
    const alert = new Alert();
    alert.title = "Cannot Check SplatNet 3 Version";
    alert.message = "s3s3 cannot check SplatNet 3 version. Please check your internet connectivity.";
    alert.addCancelAction("Quit");
    await alert.present();
  }
  return version;
}

async function fetchGraphQl(hash, variables, throwable) {
  const req = new Request("https://api.lp1.av5ja.srv.nintendo.net/api/graphql");
  req.method = "POST";
  // Some headers can only be fetched from Mudmouth.
  req.headers = {
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": LANG,
    Authorization: `Bearer ${BULLET_TOKEN}`,
    Connection: "keep-alive",
    // Content length is automatically filled.
    // "Content-Length": 0,
    "Content-Type": "application/json",
    Cookie: COOKIE,
    Host: "api.lp1.av5ja.srv.nintendo.net",
    Origin: "https://api.lp1.av5ja.srv.nintendo.net",
    Referer: "https://api.lp1.av5ja.srv.nintendo.net/",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent": USER_AGENT,
    "x-web-view-ver": SPLATNET_VERSION,
  };
  req.body = JSON.stringify({
    extensions: {
      persistedQuery: {
        sha256Hash: hash,
        version: 1,
      },
    },
    variables: variables,
  });
  try {
    const json = await req.loadJSON();
    return json["data"];
  } catch {
    if (req.response?.statusCode) {
      if (req.response.statusCode === 401) {
        const alert = new Alert();
        alert.title = "Failed to Fetch";
        alert.message = `s3s3 cannot fetch from SplatNet 3. Your bullet token may be expired. Please use s3s3 from Mudmouth. See https://github.com/zhxie/s3s3 for more.`;
        alert.addAction("See Instructions");
        alert.addCancelAction("Quit");
        const res = await alert.present();
        if (res === 0) {
          await Safari.openInApp("https://github.com/zhxie/s3s3?tab=readme-ov-file#usage");
        }
      } else {
        if (throwable) {
          throw "s3s3 cannot fetch from SplatNet 3.";
        }
        const alert = new Alert();
        alert.title = "Failed to Fetch";
        alert.message = `s3s3 cannot fetch from SplatNet 3. Please file a bug on https://github.com/zhxie/s3s3/issues. \n\n${req.response.statusCode}`;
        alert.addCancelAction("Quit");
        await alert.present();
      }
    } else {
      const alert = new Alert();
      alert.title = "Failed to Fetch";
      alert.message = `s3s3 cannot fetch from SplatNet 3. Please check your internet connectivity.`;
      alert.addCancelAction("Quit");
      await alert.present();
    }
    return undefined;
  }
}

async function getUploaded(path) {
  let json;
  const req = new Request(`https://stat.ink/api/v3/${path}/uuid-list`);
  req.headers = { Authorization: `Bearer ${API_KEY}` };
  try {
    json = await req.loadJSON();
  } catch {
    const alert = new Alert();
    alert.title = "Failed to Get Uploaded List";
    alert.message = `s3s3 cannot get uploaded list from stat.ink. Please check your internet connectivity.`;
    alert.addCancelAction("Quit");
    await alert.present();
    return undefined;
  }

  if (json["status"]) {
    const alert = new Alert();
    alert.title = "Failed to Get Uploaded List";
    alert.message = `s3s3 cannot get uploaded list from stat.ink. ${JSON.stringify(json["message"])}`;
    alert.addCancelAction("Quit");
    await alert.present();
    return undefined;
  }
  return json;
}

function generateUuidV5(namespace, name) {
  function sha1(message) {
    function rotateLeft(n, s) {
      return (n << s) | (n >>> (32 - s));
    }

    const length = message.length * 8;
    const words = [];
    for (let i = 0; i < message.length; i++) {
      words[i >> 2] |= message[i] << (24 - (i % 4) * 8);
    }
    words[length >> 5] |= 0x80 << (24 - (length % 32));
    words[(((length + 64) >> 9) << 4) + 15] = length;

    let h0 = 0x67452301;
    let h1 = 0xefcdab89;
    let h2 = 0x98badcfe;
    let h3 = 0x10325476;
    let h4 = 0xc3d2e1f0;

    for (let i = 0; i < words.length; i += 16) {
      const w = new Array(80);
      for (let t = 0; t < 16; t++) {
        w[t] = words[i + t] || 0;
      }
      for (let t = 16; t < 80; t++) {
        w[t] = rotateLeft(w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16], 1);
      }

      let a = h0,
        b = h1,
        c = h2,
        d = h3,
        e = h4;

      for (let t = 0; t < 80; t++) {
        let f, k;
        if (t < 20) {
          f = (b & c) | (~b & d);
          k = 0x5a827999;
        } else if (t < 40) {
          f = b ^ c ^ d;
          k = 0x6ed9eba1;
        } else if (t < 60) {
          f = (b & c) | (b & d) | (c & d);
          k = 0x8f1bbcdc;
        } else {
          f = b ^ c ^ d;
          k = 0xca62c1d6;
        }

        const temp = (rotateLeft(a, 5) + f + e + k + w[t]) >>> 0;
        e = d;
        d = c;
        c = rotateLeft(b, 30);
        b = a;
        a = temp;
      }

      h0 = (h0 + a) >>> 0;
      h1 = (h1 + b) >>> 0;
      h2 = (h2 + c) >>> 0;
      h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0;
    }

    const hash = new Uint8Array(20);
    [h0, h1, h2, h3, h4].forEach((h, i) => {
      hash[i * 4 + 0] = (h >>> 24) & 0xff;
      hash[i * 4 + 1] = (h >>> 16) & 0xff;
      hash[i * 4 + 2] = (h >>> 8) & 0xff;
      hash[i * 4 + 3] = h & 0xff;
    });
    return hash;
  }

  const namespaceBytes = namespace
    .replace(/-/g, "")
    .match(/.{1,2}/g)
    .map((byte) => parseInt(byte, 16));
  const nameBytes = Array.from(name).map((e) => e.charCodeAt(0));
  const combinedBytes = new Uint8Array(namespaceBytes.length + nameBytes.length);

  combinedBytes.set(namespaceBytes);
  combinedBytes.set(nameBytes, namespaceBytes.length);

  const hashBytes = sha1(combinedBytes);
  const uuidBytes = hashBytes.slice(0, 16);

  uuidBytes[6] = (uuidBytes[6] & 0x0f) | 0x50;
  uuidBytes[8] = (uuidBytes[8] & 0x3f) | 0x80;

  const hex = Array.from(uuidBytes)
    .map((e) => e.toString(16).padStart(2, "0"))
    .join("");
  const uuid = `${hex.substr(0, 8)}-${hex.substr(8, 4)}-${hex.substr(12, 4)}-${hex.substr(16, 4)}-${hex.substr(20)}`;
  return uuid;
}

async function upload(path, id, payload) {
  payload["test"] = TEST_MODE ? "yes" : "no";
  payload["agent"] = "s3s3";
  payload["agent_version"] = `v${A_VERSION}`;

  const req = new Request(`https://stat.ink/api/v3/${path}`);
  req.method = "POST";
  req.headers = { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" };
  req.body = JSON.stringify(payload);
  try {
    const json = await req.loadJSON();
    if (json["status"]) {
      const alert = new Alert();
      alert.title = "Failed to Upload";
      alert.message = `s3s3 cannot upload ${id} to stat.ink. ${JSON.stringify(json["message"])}`;
      alert.addCancelAction("OK");
      await alert.present();
    } else if (json["error"]) {
      const alert = new Alert();
      alert.title = "Failed to Upload";
      alert.message = `s3s3 cannot upload ${id} to stat.ink. Please file a bug on https://github.com/zhxie/s3s3/issues. \n\n${JSON.stringify(json["error"])}`;
      alert.addCancelAction("OK");
      await alert.present();
    } else {
      console.log(`Upload to: ${json["url"]}`);
      return json["url"];
    }
  } catch {
    const alert = new Alert();
    alert.title = "Failed to Upload";
    alert.message = `s3s3 cannot upload to stat.ink. Please check your internet connectivity.`;
    alert.addCancelAction("OK");
    await alert.present();
  }
}

async function scheduleNotification(url) {
  const notification = new Notification();
  notification.title = "Result Uploaded";
  notification.body = `New result uploaded to ${url}.`;
  await notification.schedule();
}

function decodeBase64Index(b64Str) {
  let str = Data.fromBase64String(b64Str).toRawString();
  str = str.replaceAll("VsStage-", "");
  str = str.replaceAll("VsMode-", "");
  str = str.replaceAll("SpecialWeapon-", "");
  str = str.replaceAll("Weapon-", "");
  str = str.replaceAll("CoopStage-", "");
  str = str.replaceAll("CoopGrade-", "");
  str = str.replaceAll("CoopEnemy-", "");
  str = str.replaceAll("CoopEventWave-", "");
  str = str.replaceAll("CoopUniform-", "");
  return str;
}

function convertColor(color) {
  const r = Math.floor(255 * color["r"])
    .toString(16)
    .padStart(2, "0");
  const g = Math.floor(255 * color["g"])
    .toString(16)
    .padStart(2, "0");
  const b = Math.floor(255 * color["b"])
    .toString(16)
    .padStart(2, "0");
  const a = Math.floor(255 * color["a"])
    .toString(16)
    .padStart(2, "0");
  return `${r}${g}${b}${a}`;
}

function translateGearAbility(url) {
  const Abilities = {
    "5c98cc37d2ce56291a7e430459dc9c44d53ca98b8426c5192f4a53e6dd6e4293": "ink_saver_main",
    "11293d8fe7cfb82d55629c058a447f67968fc449fd52e7dd53f7f162fa4672e3": "ink_saver_sub",
    "29b845ea895b931bfaf895e0161aeb47166cbf05f94f04601769c885d019073b": "ink_recovery_up",
    "3b6c56c57a6d8024f9c7d6e259ffa2e2be4bdf958653b834e524ffcbf1e6808e": "run_speed_up",
    "087ffffe40c28a40a39dc4a577c235f4cc375540c79dfa8ede1d8b63a063f261": "swim_speed_up",
    e8668a2af7259be74814a9e453528a3e9773435a34177617a45bbf79ad0feb17: "special_charge_up",
    e3154ab67494df2793b72eabf912104c21fbca71e540230597222e766756b3e4: "special_saver",
    fba267bd56f536253a6bcce1e919d8a48c2b793c1b554ac968af8d2068b22cab: "special_power_up",
    aaa9b7e95a61bfd869aaa9beb836c74f9b8d4e5d4186768a27d6e443c64f33ce: "quick_respawn",
    "138820ed46d68bdf2d7a21fb3f74621d8fc8c2a7cb6abe8d7c1a3d7c465108a7": "quick_super_jump",
    "9df9825e470e00727aa1009c4418cf0ace58e1e529dab9a7c1787309bb25f327": "sub_power_up",
    db36f7e89194ed642f53465abfa449669031a66d7538135c703d3f7d41f99c0d: "ink_resistance_up",
    "664489b24e668ef1937bfc9a80a8cf9cf4927b1e16481fa48e7faee42122996d": "sub_resistance_up",
    "1a0c78a1714c5abababd7ffcba258c723fefade1f92684aa5f0ff7784cc467d0": "intensify_action",
    "85d97cd3d5890b80e020a554167e69b5acfa86e96d6e075b5776e6a8562d3d4a": "opening_gambit",
    d514787f65831c5121f68b8d96338412a0d261e39e522638488b24895e97eb88: "last_ditch_effort",
    aa5b599075c3c1d27eff696aeded9f1e1ddf7ae3d720268e520b260db5600d60: "tenacity",
    "748c101d23261aee8404c573a947ffc7e116a8da588c7371c40c4f2af6a05a19": "comeback",
    "2c0ef71abfb3efe0e67ab981fc9cd46efddcaf93e6e20da96980079f8509d05d": "ninja_squid",
    de15cad48e5f23d147449c70ee4e2973118959a1a115401561e90fc65b53311b: "haunt",
    "56816a7181e663b5fedce6315eb0ad538e0aadc257b46a630fcfcc4a16155941": "thermal_ink",
    de0d92f7dfed6c76772653d6858e7b67dd1c83be31bd2324c7939105180f5b71: "respawn_punisher",
    "0d6607b6334e1e84279e482c1b54659e31d30486ef0576156ee0974d8d569dbc": "ability_doubler",
    f9c21eacf6dbc1d06edbe498962f8ed766ab43cb1d63806f3731bf57411ae7b6: "stealth_jump",
    "9d982dc1a7a8a427d74df0edcebcc13383c325c96e75af17b9cdb6f4e8dafb24": "object_shredder",
    "18f03a68ee64da0a2e4e40d6fc19de2e9af3569bb6762551037fd22cf07b7d2d": "drop_roller",
    dc937b59892604f5a86ac96936cd7ff09e25f18ae6b758e8014a24c7fa039e91: null,
  };

  for (const key of Object.keys(Abilities)) {
    if (url.includes(key)) {
      return Abilities[key];
    }
  }
}

function translateWeapon(url) {
  const Weapons = {
    "6e58a0747ab899badcb6f351512c6034e0a49bd6453281f32c7f550a2132fd65": 0,
    "8e134a80cd54f4235329493afd43ff754b367a65e460facfcca862b174754b0e": 10,
    "25e98eaba1e17308db191b740d9b89e6a977bfcd37c8dc1d65883731c0c72609": 20,
    "5ec00bcf96c7a3f731d7a2e67f60f802f33d22f07177b94d5905f471b08b629f": 30,
    "01e8399a3c56707b6e9f7500d3d583ba1d400eec06449d8fe047cda1956a4ccc": 50,
    e3874d7d504acf89488ad7f68d29a348caea1a41cd43bd9a272069b0c0466570: 40,
    e6dbf73aa6ff9d1feb61fcabadb2d31e08b228a9736b4f5d8a5baeab9b493255: 60,
    "5607f7014bbc7339feeb67218c05ef19c7a466152b1bd056a899b955127ea433": 70,
    fe2b351799aa48fcb48154299ff0ccf0b0413fc291ffc49456e93db29d2f1db5: 80,
    "035920eb9428955c25aecb8a56c2b1b58f3e322af3657d921db1778de4b80c59": 90,
    "8034dd1acde77c1a2df32197c12faa5ba1d65b43d008edd1b40f16fa8d106944": 100,
    "10d4a1584d1428cb164ddfbc5febc9b1e77fd05e2e9ed9de851838a94d202c15": 200,
    "29ccca01285a04f42dc15911f3cd1ee940f9ca0e94c75ba07378828afb3165c0": 210,
    "0d2963b386b6da598b8da1087eab3f48b99256e2e6a20fc8bbe53b34579fb338": 220,
    be8ba95bd3017a83876e7f769ee37ee459ee4b2d6eca03fceeb058c510adbb61: 230,
    "0a929d514403d07e1543e638141ebace947ffd539f5f766b42f4d6577d40d7b8": 240,
    "954a5ea059f841fa5f1cd2596bb32f23b3d3b03fc3fa7972077bdbafe6051215": 250,
    "3f8b7fb5cfa592fd251fe4f5707465e539ed79b8d4ae17df75198fbabec2e88f": 260,
    "96833fc0f74242cd2bc73b241aab8a00d499ce9f6557722ef6503e12af8979f4": 300,
    "418d75d9ca0304922f06eff539c511238b143ef8331969e20d54a9560df57d5a": 310,
    db9f2ff8fab9f74c05c7589d43f132eacbff94154dcc20e09c864fced36d4d95: 400,
    "29358fd25b6ad1ba9e99f5721f0248af8bde7f1f757d00cbbc7a8a6be02a880d": 1000,
    "536b28d9dd9fc6633a4bea4a141d63942a0ba3470fc504e5b0d02ee408798a87": 1010,
    "18fdddee9c918842f076c10f12e46d891aca302d2677bf968ee2fe4e65b831a8": 1020,
    "8351e99589f03f49b5d681d36b083aaffd9c486a0558ab957ac44b0db0bb58bb": 1030,
    "137559b59547c853e04c6cc8239cff648d2f6b297edb15d45504fae91dfc9765": 1040,
    "260428edbf919f5c9e8c8517516d6a7a8133cf7348d216768ab4fb9434053f08": 1100,
    ce0bb38588e497586a60f16e0aca914f181f42be29953742fd4a55a97e2ebd22: 1110,
    c1f1f56982bd7d28714615a69da6e33c5157ec22b1c62092ec8d60a67b6b29ef: 1120,
    "0cdd6036a6677d68bf28e1014b09a6f5a043e969027e532cd008049baace6527": 2000,
    "3f99800b569e286305669b7ab28dc3ff0f0b1b015600569d5ac30ab8a97047a0": 2010,
    f6354a66c47ec15517bb457e3c48c97c3ff62d34ff38879dbb3e1665dea1be5a: 2020,
    ed294b2c7b3111988d577d7efddb9e5e475efc5e0932e5416efedc41fd98eb04: 2030,
    ebc007b2f27b0813f0c9ce7371bdab78c62e6a05777c928bf34222a79d99de8f: 2040,
    "9c71334ea792864a00531040e0d05a183512e11277fd1fa681170874ba039268": 2050,
    "2b349390a464710982d7e1496130898e7b5a66c301aa44fc9e19332d42e360ad": 2060,
    "082489b182fbbabddde40831dac5867d6acc4778b6a38d8f5c8d445455d638eb": 2070,
    "4a8bf6b4ad3b2942728bbd270bf64d5848b64f3c843a3b12ef83c0ebb5de1b3d": 3000,
    f3dbd98d5b0e89f7be7eff25a5c63a06045fe64d8ffd5886e79c855e16791563: 3010,
    bd2eca9a7b4109c1d96e804c74aaf2ca525011e1348d0b312fe4f034e35e5d4c: 3020,
    "0199e455872acba1ab8ef0040eca7f41afca48c1f9ad2c5d274323d6dbc49133": 3030,
    "1e32f5e1e65793585f6423e4fcae1a146a79d2a09e6e15575015af8a2032a4fe": 3040,
    "1cf241ee28b282db23d25f1cce3d586151b9b67f4ba20cf5e2e74c82e988c352": 3050,
    "32dbc48e000d5d2015468e1dafc05e7c24581a73e54e758af0c8b9e2db3db550": 4000,
    fd06f01742a3b25ac57941150b3b81d56633831902f2da1f19a6244f2d8dd6fd: 4010,
    "34fe0401b6f6a0b09839696fc820ece9570a9d56e3a746b65f0604dec91a9920": 4020,
    "206dbf3b5dfc9962b6a783acf68a856f0c8fbf0c56257c2ca5c25d63198dd6e1": 4030,
    be4316928f4b031b470ec2cc2c48fb922a303c882802e32d7fa802249edaa212: 4040,
    "7f0192b8786a6fa7d5ed993022b1667de2fd90dadd8d34a3a7dff9578d34fa0a": 4050,
    f1c8fc32bd90fc9258dc17e9f9bcfd5e6498f6e283709bf1896b78193b8e39e9: 5000,
    b43978029ea582de3aca34549cafd810df20082b94104634093392e11e30d9bd: 5010,
    "802d3d501738c620b4f709203ccad343490bd3340b2fda21eb38a362320dc6ed": 5020,
    b8f50833f99b0db251dc1812e5d13df09b393635b9b6bd684525112cbb38e5e4: 5030,
    e68609e51d30dfb13e1ea996e46995ed1f7cf561caef0fe96314966d0a039109: 5040,
    d6d8c3bce9bd3934a5900642cb6f87c7e340e39cccfde1f8f28ce17e3a1769b0: 5050,
    "15d101d0d11acbb8159e2701282879f2617d90c8573fd2f2239807721ff54ca4": 6000,
    a7b1903741696c0ebeda76c9e16fa0a81ae4e37f5331ad6282fc2be1ae1c1c59: 6010,
    "7508ba286e5ac5befe63daea807ab54996c3f0ef3577be9ab5d2827c49dedd75": 6020,
    "1e62c90d72a8c11a91ca85be6fe6a3042514e1d77bd01ed65c22ef8e7256809a": 6030,
    "676d9f49276f171a93ac06646c0fbdfbeb8c3d0284a057aee306404a6034ffef": 7010,
    "9baac6cc774d0e6f2ac8f6e217d700e6f1f47320130598c5f1e922210ccdcc89": 7020,
    "14e5480dcebea47ee9843a1fe5e21f468f0ebc4dbaef04df4ff7930edddd2dac": 7030,
    ddd2a4258a70cdaf8a1dbc0ded024db497445d71f950fe7645fa8c69a178a082: 8000,
    "3aa72d418643038a9e3248af734b0d6a0bf3d3bf9793d75912b1b959f93c2258": 8010,
    "7175449ebf69cd8c6125538e08682750b71f39403dc0ca336d58c64a48c4cc18": 8020,
    "0962405d6aecff4a075c46e895c42984e33b26c4b2b4b25c5058366db3c35ba4": 20900,
    ea9dd38bbce1cd8b879f59b5afc97a47d79cd413ad8d2fcbb504a2ac8f01036e: 21900,
    "5cc158250a207241f51d767a47bbb6139fe1c4fb652cc182b73aac93baa659c5": 22900,
    bf89bcf3d3a51badd78b436266e6b7927d99ac386e083023df3551da6b39e412: 23900,
    "411abcfee82b63a97af1613885b90daa449f4a847eff6c1d7f093b705040a9f0": 25900,
    "3380019464e3111a0f40e633be25f73ad34ec1844d2dc7852a349b29b238932b": 26900,
    "36e03d8d1e6bc4f7449c5450f4410c6c8449cde0548797d22ab641cd488d2060": 27900,
    "480bc1dfb0beed1ce4625a6a6b035e4bac711de019bb9b0e5125e4e7e39e0719": 28900,
  };
  for (const key of Object.keys(Weapons)) {
    if (url.includes(key)) {
      return Weapons[key];
    }
  }
}
