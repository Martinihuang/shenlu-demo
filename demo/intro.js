(function(){
 'use strict';
 const localeAPI=window.ShenluDemoLocale;
 const copy={
  "zh-Hant": {
    "pageTitle": "神籙｜三國神話，六段旅程",
    "skip": "跳到遊戲介紹",
    "brandNote": "免費網頁 Demo",
    "title": "三國神話，六段旅程",
    "intro": "走入台灣山林、埃及神殿與北歐命線。跟隨六位主角的故事，以靈體與卡牌迎接挑戰。",
    "play": "立即試玩",
    "testingLink": "Android 封測準備中・查看說明",
    "compatibility": "使用瀏覽器，無須安裝。手機建議橫向，內容依遊玩需要載入。",
    "realms": "台灣山林　／　埃及神殿　／　北歐命線",
    "testingTitle": "一起讓《神籙》更好",
    "testingStatus": "Android 封測尚未開放",
    "testingBody": "Google Play 版本仍在準備中，目前可以先玩網頁 Demo。封測正式開放後，這裡會提供加入測試與從 Google Play 安裝的步驟。",
    "testingRule": "網頁試玩不計入 Google Play 的 14 天封閉測試。封測開放後，請由 Google Play 加入並安裝測試版。",
    "back": "返回遊戲介紹",
    "saveNote": "遊戲進度儲存在目前瀏覽器；請善用遊戲內的匯出備份。",
    "direct": "直接進入遊戲開場",
    "preferenceError": "此瀏覽器無法記住語言偏好。請保留含語系的網址，下次可直接使用。"
  },
  "en": {
    "pageTitle": "Shenlu | Three mythologies, six journeys",
    "skip": "Skip to the game introduction",
    "brandNote": "Free web demo",
    "title": "Three mythologies. Six journeys.",
    "intro": "Explore Taiwan’s forests, Egypt’s temples and the world of Norse myth. Follow six heroes’ stories and face their trials in card battles with Spirits.",
    "play": "Play the web demo",
    "testingLink": "About Android closed testing",
    "compatibility": "Play in your browser without installing an app. Use landscape mode on phones. Content loads as needed.",
    "realms": "Taiwanese forests / Egyptian temples / Norse fate",
    "testingTitle": "Help shape Shenlu",
    "testingStatus": "Android closed testing is not open yet",
    "testingBody": "We’re preparing the Google Play version. You can play the web demo now. When closed testing opens, this page will explain how to join and install the test version through Google Play.",
    "testingRule": "Browser play does not count toward the 14-day Google Play closed test. When it opens, join and install the test build through Google Play.",
    "back": "Back to the introduction",
    "saveNote": "Progress is saved in this browser. Use the game’s export feature to back up your save.",
    "direct": "Go to the game’s start screen",
    "preferenceError": "This browser couldn’t save your language preference. Save this link to use the same language next time."
  },
  "ja": {
    "pageTitle": "神籙｜三つの神話、六つの旅",
    "skip": "ゲーム紹介へ移動",
    "brandNote": "無料ウェブ体験版",
    "title": "三つの神話、六つの旅",
    "intro": "台湾の山林、エジプトの神殿、北欧神話の世界へ。六人の主人公の物語をたどり、霊体とともにカードバトルに挑もう。",
    "play": "ウェブ体験版を遊ぶ",
    "testingLink": "Android クローズドテストについて",
    "compatibility": "インストール不要。ブラウザで遊べます。スマートフォンは横向き推奨。データは必要に応じて読み込みます。",
    "realms": "台湾の山林 ／ エジプトの神殿 ／ 北欧の運命",
    "testingTitle": "『神籙』を、一緒に育てる",
    "testingStatus": "Android クローズドテストは準備中",
    "testingBody": "Google Play 版は現在準備中です。まずはウェブ体験版をお楽しみください。テスト開始後、このページで参加方法と Google Play からのインストール手順をご案内します。",
    "testingRule": "ブラウザでのプレイはGoogle Playの14日間のクローズドテストには含まれません。開始後、Google Playで参加してテスト版をインストールしてください。",
    "back": "ゲーム紹介へ戻る",
    "saveNote": "進行状況はこのブラウザに保存されます。ゲーム内のエクスポート機能でセーブデータをバックアップできます。",
    "direct": "ゲームのスタート画面へ",
    "preferenceError": "このブラウザでは言語設定を保存できません。次回も同じ言語で表示するには、このリンクを保存してください。"
  },
  "ko": {
    "pageTitle": "신록｜세 신화, 여섯 여정",
    "skip": "게임 소개로 이동",
    "brandNote": "무료 웹 데모",
    "title": "세 신화, 여섯 여정",
    "intro": "대만의 숲, 이집트의 신전, 북유럽 신화의 세계로 떠나세요. 여섯 주인공의 이야기를 따라 영체와 함께 카드 전투에 도전하세요.",
    "play": "웹 데모 플레이하기",
    "testingLink": "Android 비공개 테스트 안내",
    "compatibility": "설치 없이 브라우저에서 플레이하세요. 휴대전화에서는 가로 모드를 권장합니다. 콘텐츠는 필요할 때 불러옵니다.",
    "realms": "대만의 숲 / 이집트의 신전 / 북유럽의 운명",
    "testingTitle": "함께 만들어 가는 신록",
    "testingStatus": "Android 비공개 테스트 준비 중",
    "testingBody": "Google Play 버전은 준비 중입니다. 지금은 웹 데모를 즐길 수 있습니다. 비공개 테스트가 시작되면 이 페이지에서 참여 절차와 Google Play에서 테스트 버전을 설치하는 방법을 안내합니다.",
    "testingRule": "브라우저 플레이는 Google Play의 14일 비공개 테스트에 포함되지 않아요. 테스트가 열리면 Google Play에서 참여하고 테스트 버전을 설치하세요.",
    "back": "게임 소개로 돌아가기",
    "saveNote": "진행 상황은 현재 브라우저에 저장됩니다. 게임 내 내보내기 기능으로 저장 데이터를 백업하세요.",
    "direct": "게임 시작 화면으로 이동",
    "preferenceError": "이 브라우저에서는 언어 설정을 저장할 수 없습니다. 다음에도 같은 언어로 보려면 이 링크를 저장해 두세요."
  },
  "zh-Hans": {
    "pageTitle": "神籙｜三国神话，六段旅程",
    "skip": "跳到游戏介绍",
    "brandNote": "免费网页 Demo",
    "title": "三国神话，六段旅程",
    "intro": "走入台湾山林、埃及神殿与北欧命线。跟随六位主角的故事，以灵体与卡牌迎接挑战。",
    "play": "立即试玩",
    "testingLink": "Android 封测准备中・查看说明",
    "compatibility": "使用浏览器，无须安装。手机建议横向，内容按游玩需要加载。",
    "realms": "台湾山林　／　埃及神殿　／　北欧命线",
    "testingTitle": "一起让《神籙》更好",
    "testingStatus": "Android 封测尚未开放",
    "testingBody": "Google Play 版本仍在准备中，目前可以先玩网页 Demo。封测正式开放后，这里会提供加入测试与从 Google Play 安装的步骤。",
    "testingRule": "网页试玩不计入 Google Play 的 14 天封闭测试。封测开放后，请通过 Google Play 加入并安装测试版。",
    "back": "返回游戏介绍",
    "saveNote": "游戏进度保存在当前浏览器；请使用游戏内的导出功能备份。",
    "direct": "直接进入游戏开场",
    "preferenceError": "此浏览器无法记住语言偏好。请保留包含语言参数的网址，下次可直接使用。"
  }
};
 const nav=document.querySelector('[data-languages]');
 for(const locale of localeAPI.supported){const button=document.createElement('button');button.type='button';button.lang=locale;button.textContent=localeAPI.labels[locale];button.dataset.locale=locale;button.addEventListener('click',()=>render(locale));nav.append(button);}
 function render(locale){
  const words=copy[locale];document.documentElement.lang=locale;document.title=words.pageTitle;
  for(const el of document.querySelectorAll('[data-copy]'))el.textContent=words[el.dataset.copy];
  for(const el of nav.querySelectorAll('button'))el.setAttribute('aria-pressed',String(el.dataset.locale===locale));
  for(const el of document.querySelectorAll('#play-demo,[data-direct-game]')){const url=new URL('preview/opening.html',location.href);url.searchParams.set('lang',locale);el.href=url.href;}
  document.querySelector('meta[name=description]').content=words.intro;
  document.querySelector('meta[property="og:title"]').content=words.pageTitle;
  document.querySelector('meta[property="og:description"]').content=words.intro;
  document.getElementById('preference-status').textContent=localeAPI.remember(locale)?'':words.preferenceError;
  localeAPI.setURL(locale);
 }
 render(localeAPI.current());
})();
