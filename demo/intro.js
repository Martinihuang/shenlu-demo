(function(){
 'use strict';
 const localeAPI=window.ShenluDemoLocale;
 const copy={
  "zh-Hant": {
    "pageTitle": "神籙｜三國神話，六段旅程",
    "skip": "跳到遊戲介紹",
    "brandNote": "免費網頁 Demo",
    "title": "三國神話，六段旅程",
    "intro": "跟隨六位主角走入三國神話，以靈體召喚與卡牌攻防推進故事。",
    "play": "立即試玩",
    "testingLink": "Android 自助報名・查看進度",
    "compatibility": "免安裝，瀏覽器即可玩。手機遊玩時建議橫向。",
    "realms": "台灣山林　／　埃及神殿　／　北歐命線",
    "testingTitle": "一起讓《神籙》更好",
    "testingStatus": "已送交 Google 審查・可先加入群組",
    "testingBody": "Android 0.1.5（6）已提交 Google Play 封閉測試審查，預計提供台灣及美國、18 歲以上測試者。現在可自行加入測試群組；遊戲下載仍須等待 Google 核准。",
    "testingRule": "網頁試玩與加入群組，都不等同加入 Play 封測。核准開放後，請用同一 Google 帳號加入 Play 測試並安裝遊戲；14 天資格以 Play 的持續參加狀態計算。",
    "back": "返回遊戲介紹",
    "saveNote": "遊戲進度儲存在目前瀏覽器；請善用遊戲內的匯出備份。",
    "direct": "直接進入遊戲開場",
    "preferenceError": "此瀏覽器無法記住語言偏好。請保留含語系的網址，下次可直接使用。",
    "creator": "製作：Martin",
    "privacy": "隱私與資料說明",
    "testingStepsTitle": "如何自行加入 Android 測試",
    "testingStep1Title": "加入測試群組",
    "testingStep1Body": "使用手機 Play 商店的 Google 帳號加入，不需留言公開 Email，也不需等我逐筆加入名單。群組管理者可看到加入帳號；成員名單與 Email 不公開。",
    "testingGroup": "自行加入 Google 測試群組",
    "testingStep2Title": "加入 Play 測試並下載",
    "testingStep2Body": "Google 核准後，這裡會開放 Play 加入與下載入口。若頁面仍顯示未受邀，請先確認同一帳號已加入群組；審查尚未完成時也無法下載。",
    "testingPending": "Play 加入與下載：等待 Google 核准",
    "testingInternal": "已參加舊版「內部測試」的人，開放後請先退出內部測試，再用同一帳號加入封閉測試。"
  },
  "en": {
    "pageTitle": "Shenlu | Three mythologies, six journeys",
    "skip": "Skip to the game introduction",
    "brandNote": "Free web demo",
    "title": "Three mythologies. Six journeys.",
    "intro": "Enter the myths of Taiwan, Egypt and the Norse world. Follow six heroes through story chapters, summon spirits and play cards to meet each challenge.",
    "play": "Play the web demo",
    "testingLink": "Android self-signup · test status",
    "compatibility": "Play in your browser, no installation needed. Turn your phone sideways for play.",
    "realms": "Taiwanese forests / Egyptian temples / Norse fate",
    "testingTitle": "Help shape Shenlu",
    "testingStatus": "Submitted to Google · group signup available",
    "testingBody": "Android 0.1.5 (6) has been submitted for Google Play closed-test review for testers aged 18+ in Taiwan and the United States. You can join the tester group now. Game downloads still require Google approval.",
    "testingRule": "Browser play and group membership do not count as Play test opt-in. Once approved, use the same Google account to opt in and install through Play. The 14-day requirement uses continuous participation recorded by Play.",
    "back": "Back to the introduction",
    "saveNote": "Progress is saved in this browser. Use the game’s export feature to back up your save.",
    "direct": "Go to the game’s start screen",
    "preferenceError": "This browser couldn’t save your language preference. Save this link to use the same language next time.",
    "creator": "Created by Martin",
    "privacy": "Privacy & data",
    "testingStepsTitle": "Join the Android test yourself",
    "testingStep1Title": "Join the tester group",
    "testingStep1Body": "Use the Google account from your phone’s Play Store. No public email comment or manual invitation is needed. The group owner can see your joining account; member lists and emails are not public.",
    "testingGroup": "Join the Google tester group",
    "testingStep2Title": "Opt in on Play and download",
    "testingStep2Body": "The Play opt-in and download link will open here after Google approval. If you see an invitation error, check that the same account has joined the group. Downloads are unavailable while review is pending.",
    "testingPending": "Play opt-in and download: awaiting Google approval",
    "testingInternal": "Already in the old internal test? Once the closed test opens, leave internal testing before opting in with the same account."
  },
  "ja": {
    "pageTitle": "神籙｜三つの神話、六つの旅",
    "skip": "ゲーム紹介へ移動",
    "brandNote": "無料ウェブ体験版",
    "title": "三つの神話、六つの旅",
    "intro": "台湾・エジプト・北欧の神話へ。6人の主人公の物語を進め、霊体召喚とカードの攻防で挑戦に立ち向かおう。",
    "play": "ウェブ体験版を遊ぶ",
    "testingLink": "Android テストの自己登録・進捗",
    "compatibility": "インストール不要、ブラウザで遊べます。スマートフォンは横向きがおすすめです。",
    "realms": "台湾の山林 ／ エジプトの神殿 ／ 北欧の運命",
    "testingTitle": "『神籙』を、一緒に育てる",
    "testingStatus": "Google に審査提出済み・グループ登録可能",
    "testingBody": "Android 0.1.5（6）はGoogle Playのクローズドテスト審査に提出済みです。台湾・米国の18歳以上が対象です。テスターグループには今すぐ参加できますが、ダウンロードにはGoogleの承認が必要です。",
    "testingRule": "ブラウザでのプレイやグループ参加だけではPlayテスト参加になりません。承認後、同じGoogleアカウントでテストに参加してインストールしてください。14日間の条件はPlayが記録する継続参加に基づきます。",
    "back": "ゲーム紹介へ戻る",
    "saveNote": "進行状況はこのブラウザに保存されます。ゲーム内のエクスポート機能でセーブデータをバックアップできます。",
    "direct": "ゲームのスタート画面へ",
    "preferenceError": "このブラウザでは言語設定を保存できません。次回も同じ言語で表示するには、このリンクを保存してください。",
    "creator": "制作：Martin",
    "privacy": "プライバシーとデータ",
    "testingStepsTitle": "Android テストへの参加方法",
    "testingStep1Title": "テスターグループに参加",
    "testingStep1Body": "スマートフォンのPlayストアと同じGoogleアカウントを使ってください。メールアドレスの公開コメントや個別招待は不要です。管理者は参加アカウントを確認できますが、メンバー一覧とメールは非公開です。",
    "testingGroup": "Google テスターグループに参加",
    "testingStep2Title": "Play で参加してダウンロード",
    "testingStep2Body": "Googleの承認後、ここでPlayの参加・ダウンロードリンクを公開します。招待エラーが出る場合は、同じアカウントでグループに参加したか確認してください。審査中はダウンロードできません。",
    "testingPending": "Play 参加・ダウンロード：Google の承認待ち",
    "testingInternal": "旧内部テストに参加中の場合、クローズドテスト開始後に内部テストを退出してから、同じアカウントで参加してください。"
  },
  "ko": {
    "pageTitle": "신록｜세 신화, 여섯 여정",
    "skip": "게임 소개로 이동",
    "brandNote": "무료 웹 데모",
    "title": "세 신화, 여섯 여정",
    "intro": "대만·이집트·북유럽 신화 속으로 떠나세요. 여섯 주인공의 이야기를 따라 영체를 소환하고 카드로 공격과 방어를 펼치세요.",
    "play": "웹 데모 플레이하기",
    "testingLink": "Android 직접 신청·진행 상황",
    "compatibility": "설치 없이 브라우저에서 플레이하세요. 휴대전화는 가로로 돌려 주세요.",
    "realms": "대만의 숲 / 이집트의 신전 / 북유럽의 운명",
    "testingTitle": "함께 만들어 가는 신록",
    "testingStatus": "Google 심사 제출 완료·그룹 가입 가능",
    "testingBody": "Android 0.1.5(6)를 Google Play 비공개 테스트 심사에 제출했습니다. 대만과 미국의 만 18세 이상 테스터가 대상입니다. 테스트 그룹에는 지금 가입할 수 있지만 게임 다운로드는 Google 승인 후 가능합니다.",
    "testingRule": "브라우저 플레이와 그룹 가입만으로는 Play 테스트 참여로 인정되지 않습니다. 승인 후 같은 Google 계정으로 테스트에 참여하고 설치하세요. 14일 조건은 Play에 기록된 연속 참여 상태를 기준으로 합니다.",
    "back": "게임 소개로 돌아가기",
    "saveNote": "진행 상황은 현재 브라우저에 저장됩니다. 게임 내 내보내기 기능으로 저장 데이터를 백업하세요.",
    "direct": "게임 시작 화면으로 이동",
    "preferenceError": "이 브라우저에서는 언어 설정을 저장할 수 없습니다. 다음에도 같은 언어로 보려면 이 링크를 저장해 두세요.",
    "creator": "제작: Martin",
    "privacy": "개인정보와 데이터",
    "testingStepsTitle": "Android 테스트 직접 신청 방법",
    "testingStep1Title": "테스터 그룹 가입",
    "testingStep1Body": "휴대전화 Play 스토어의 Google 계정으로 가입하세요. 이메일을 공개 댓글로 남기거나 개별 초대를 기다릴 필요가 없습니다. 그룹 관리자는 가입 계정을 볼 수 있지만 회원 명단과 이메일은 공개되지 않습니다.",
    "testingGroup": "Google 테스터 그룹 가입",
    "testingStep2Title": "Play에서 참여 후 다운로드",
    "testingStep2Body": "Google 승인 후 이곳에 Play 참여·다운로드 링크를 공개합니다. 초대 오류가 표시되면 같은 계정으로 그룹에 가입했는지 확인하세요. 심사 중에는 다운로드할 수 없습니다.",
    "testingPending": "Play 참여·다운로드: Google 승인 대기 중",
    "testingInternal": "이전 내부 테스트 참여자는 비공개 테스트가 열리면 내부 테스트에서 나간 후 같은 계정으로 참여하세요."
  },
  "zh-Hans": {
    "pageTitle": "神籙｜三国神话，六段旅程",
    "skip": "跳到游戏介绍",
    "brandNote": "免费网页 Demo",
    "title": "三国神话，六段旅程",
    "intro": "跟随六位主角走入三国神话，以灵体召唤与卡牌攻防推进故事。",
    "play": "立即试玩",
    "testingLink": "Android 自助报名・查看进度",
    "compatibility": "免安装，浏览器即可玩。手机游玩时建议横向。",
    "realms": "台湾山林　／　埃及神殿　／　北欧命线",
    "testingTitle": "一起让《神籙》更好",
    "testingStatus": "已提交 Google 审核・可先加入群组",
    "testingBody": "Android 0.1.5（6）已提交 Google Play 封闭测试审核，预计面向台湾及美国、18 岁以上测试者。现在可自行加入测试群组；游戏下载仍须等待 Google 批准。",
    "testingRule": "网页试玩和加入群组都不等于加入 Play 封测。批准开放后，请用同一 Google 账号加入 Play 测试并安装游戏；14 天资格按 Play 的持续参加状态计算。",
    "back": "返回游戏介绍",
    "saveNote": "游戏进度保存在当前浏览器；请使用游戏内的导出功能备份。",
    "direct": "直接进入游戏开场",
    "preferenceError": "此浏览器无法记住语言偏好。请保留包含语言参数的网址，下次可直接使用。",
    "creator": "制作：Martin",
    "privacy": "隐私与数据说明",
    "testingStepsTitle": "如何自行加入 Android 测试",
    "testingStep1Title": "加入测试群组",
    "testingStep1Body": "使用手机 Play 商店的 Google 账号加入，无须留言公开 Email，也无须等待逐笔加入名单。群组管理员可看到加入账号；成员名单与 Email 不公开。",
    "testingGroup": "自行加入 Google 测试群组",
    "testingStep2Title": "加入 Play 测试并下载",
    "testingStep2Body": "Google 批准后，这里会开放 Play 加入与下载入口。若页面仍显示未受邀，请先确认同一账号已加入群组；审核尚未完成时也无法下载。",
    "testingPending": "Play 加入与下载：等待 Google 批准",
    "testingInternal": "已参加旧版“内部测试”的人，开放后请先退出内部测试，再用同一账号加入封闭测试。"
  }
};
 const nav=document.querySelector('[data-languages]');
 const picker=document.createElement('select');picker.id='site-language';picker.setAttribute('aria-label','Language');
 for(const locale of localeAPI.supported){const option=document.createElement('option');option.value=locale;option.lang=locale;option.textContent=localeAPI.labels[locale];picker.append(option);}
 picker.addEventListener('change',()=>render(picker.value));nav.append(picker);
 function render(locale){
  const words=copy[locale];document.documentElement.lang=locale;document.title=words.pageTitle;
  for(const el of document.querySelectorAll('[data-copy]'))el.textContent=words[el.dataset.copy];
  picker.value=locale;
  for(const el of document.querySelectorAll('#play-demo,[data-direct-game]')){const url=new URL('preview/opening.html',location.href);url.searchParams.set('lang',locale);el.href=url.href;}
  document.querySelector('meta[name=description]').content=words.intro;
  document.querySelector('meta[property="og:title"]').content=words.pageTitle;
  document.querySelector('meta[property="og:description"]').content=words.intro;
  const remembered=localeAPI.remember(locale),status=document.getElementById('preference-status');if(status)status.textContent=remembered?'':words.preferenceError;
  const privacy=document.querySelector('[data-privacy]');if(privacy){const url=new URL('privacy.html',location.href);url.searchParams.set('lang',locale);privacy.href=url.href;}
  for(const key of ['title','description'])document.querySelector('meta[name="twitter:'+key+'"]').content=key==='title'?words.pageTitle:words.intro;
  localeAPI.setURL(locale);
 }
 render(localeAPI.current());
})();
