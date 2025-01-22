// Configuration.
// Your stat.ink API key.
// あなたのstat.ink APIキー。
// 您的stat.ink API密钥。
// 您的stat.ink API密鑰。
const API_KEY = "";
// Language used in SplatNet 3. Available values for this configuration option are
// de-DE, en-GB, en-US, es-ES, es-MX, fr-CA, fr-FR, it-IT, ja-JP, ko-KR, nl-NL, ru-RU, zh-CN and zh-TW.
// 日本語の場合はja-JPと入力してください。
// 如果您使用简体中文，请填写zh-CN。
// 如果您使用繁體中文，請填寫zh-TW。
const LANG = "en-US";

// Debug configuration. DO NOT EDIT unless you know what you are doing.
// Designated a bullet token to avoid parsing from arguments.
const BULLET_TOKEN = "" || parseBulletToken();
// Run in test mode.
const TEST_MODE = false;

// Check update.
const A_VERSION = "0.0.1";
checkUpdate();

// Prepare and configuration check.
if (API_KEY.length !== 43) {
  let alert = new Alert();
  alert.title = "Invalid stat.ink API Key";
  alert.message = "Your stat.ink API key is invalid. You can get your API key in https://stat.ink/profile.";
  alert.addCancelAction("Quit");
  await alert.present();
  return;
}
if (!["de-DE", "en-GB", "en-US", "es-ES", "es-MX", "fr-CA", "fr-FR", "it-IT", "ja-JP", "ko-KR", "nl-NL", "ru-RU", "zh-CN", "zh-TW"].includes(LANG)) {
  let alert = new Alert();
  alert.title = "Invalid Language";
  alert.message = "Your language is invalid. Please check your configuration.";
  alert.addCancelAction("Quit");
  await alert.present();
  return;
}
if (BULLET_TOKEN.length === 0) {
  let alert = new Alert();
  alert.title = "Invalid Bullet Token";
  alert.message = "Your bullet token is invalid. Please use s3s3 from Mudmouth. See https://github.com/zhxie/s3s3 for more.";
  alert.addCancelAction("Quit");
  await alert.present();
  return;
}
const SPLATNET_VERSION = await updateSplatnetVersion();
if (SPLATNET_VERSION.length === 0) {
  let alert = new Alert();
  alert.title = "Cannot Update SplatNet 3 Version";
  alert.message = "s3s3 cannot update SplatNet 3 version. Please check your internet connectivity, then file a bug on https://github.com/zhxie/s3s3/issues.";
  alert.addCancelAction("Quit");
  await alert.present();
  return;
}

// Fetch uploaded battles.
const uploadedBattleIds = await getUploaded("s3s");

// Fetch latest battles.
// TODO: fetch the latest 50 battles in each modes.
const battleData = await fetchGraphQl("b24d22fd6cb251c515c2b90044039698aa27bc1fab15801d83014d919cd45780", {});
const battleGroups = battleData["latestBattleHistories"]["historyGroups"]["nodes"];
console.log(`Battle groups: ${battleGroups.length}`);
for (const group of battleGroups) {
  const battleNodes = group["historyDetails"]["nodes"];
  console.log(`Battle nodes: ${battleNodes.length}`);
  for (const node of battleNodes) {
    const id = node["id"];
    console.log(`Battle ID: ${id}`);
    const uuid = await generateUuid5("b3a2dbf5-2c09-4792-b78c-00b548b70aeb", Data.fromBase64String(id).toRawString().slice(-52));
    if (uploadedBattleIds.includes(uuid)) {
      console.log("Omit");
      continue;
    }

    const data = await fetchGraphQl("f893e1ddcfb8a4fd645fd75ced173f18b2750e5cfba41d2669b9814f6ceaec46", { vsResultId: id });

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
          case 6:
          case 8:
            payload["lobby"] = "splatfest_open";
            break;
          case 7:
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
    await upload("battle", id, payload);
  }
}

function parseBulletToken() {
  let b64Str = args.queryParameters["requestHeaders"].replaceAll("-", "+").replaceAll("_", "/");
  if (b64Str.length % 4 !== 0) {
    for (let i = 0; i < 4 - (b64Str.length % 4); i++) {
      b64Str = b64Str + "=";
    }
  }
  const data = Data.fromBase64String(b64Str);
  const str = data.toRawString();
  const re = /Authorization: Bearer (.*)\r\n/g;
  const match = re.exec(str);
  const token = match?.[1] ?? "";
  console.log(`Bullet token: ${token}`);
  return token;
}

async function checkUpdate() {
  const req = new Request("https://raw.githubusercontent.com/zhxie/s3s3/master/s3s3.js");
  const str = await req.loadString();
  const re = /A_VERSION = "([\d.]*)"/g;
  const match = re.exec(str);
  const version = match?.[1] ?? "";
  console.log(`s3s3 version: ${version}`);

  if (version !== "" && version !== A_VERSION) {
    let alert = new Alert();
    alert.title = "New Version Available";
    alert.message = `There is a new version (${version}) of s3s3. Please update s3s3 to the latest version as soon as possible.`;
    alert.addCancelAction("OK");
    await alert.present();
  }
  return version;
}

async function updateSplatnetVersion() {
  const req = new Request("https://cdn.jsdelivr.net/gh/nintendoapis/nintendo-app-versions/data/splatnet3-app.json");
  const json = await req.loadJSON();
  const version = json["web_app_ver"] ?? "";
  console.log(`SplatNet version: ${version}`);
  return version;
}

async function fetchGraphQl(hash, variables) {
  const req = new Request("https://api.lp1.av5ja.srv.nintendo.net/api/graphql");
  req.method = "POST";
  // TODO: complete headers.
  // HACK: there are only minimum required headers. Some headers has been removed which may lead to potential issues.
  req.headers = {
    "Accept-Language": LANG,
    Authorization: `Bearer ${BULLET_TOKEN}`,
    "Content-Type": "application/json",
    "X-Requested-With": "com.nintendo.znca",
    "X-Web-View-Ver": SPLATNET_VERSION,
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
  const json = await req.loadJSON();
  return json["data"];
}

async function generateUuid5(namespace, name) {
  const req = new Request(`https://www.uuidtools.com/api/generate/v5/namespace/${namespace}/name/${name}`);
  const json = await req.loadJSON();
  const uuid = json[0];
  console.log(`UUID: ${uuid}`);
  return uuid;
}

function decodeBase64Index(b64Str) {
  let str = Data.fromBase64String(b64Str).toRawString();
  str = str.replaceAll("VsStage-", "");
  str = str.replaceAll("VsMode-", "");
  str = str.replaceAll("Weapon-", "");
  str = str.replaceAll("SpecialWeapon-", "");
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

async function getUploaded(path) {
  const req = new Request(`https://stat.ink/api/v3/${path}/uuid-list`);
  req.headers = { Authorization: `Bearer ${API_KEY}` };
  const json = await req.loadJSON();
  return json;
}

async function upload(path, id, payload) {
  payload["test"] = TEST_MODE ? "yes" : "no";
  payload["agent"] = "s3s3";
  payload["agent_version"] = `v${A_VERSION}`;

  const req = new Request(`https://stat.ink/api/v3/${path}`);
  req.method = "POST";
  req.headers = { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" };
  req.body = JSON.stringify(payload);
  const json = await req.loadJSON();
  if (json["status"]) {
    let alert = new Alert();
    alert.title = "Failed to Upload";
    alert.message = `s3s3 cannot upload ${id} to stat.ink. ${JSON.stringify(json["message"])}`;
    alert.addCancelAction("OK");
    await alert.present();
  } else if (json["error"]) {
    let alert = new Alert();
    alert.title = "Failed to Upload";
    alert.message = `s3s3 cannot upload ${id} to stat.ink. Please file a bug on https://github.com/zhxie/s3s3/issues. \n\n${JSON.stringify(json["error"])}`;
    alert.addAction("Copy to Clipboard");
    alert.addCancelAction("OK");
    const res = await alert.present();
    if (res === 0) {
      Pasteboard.copy(JSON.stringify(payload));
    }
  } else {
    console.log(`Uploaded to: ${json["url"]}`);
  }
}
