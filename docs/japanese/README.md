## 概要

これは、WebサイトまたはWebアプリ用のAdjust™のJavascript SDKガイドです。Adjust™については、[adjust.com]をご覧ください。

Read this in other languages: [English][en-readme], [中文][zh-readme], [日本語][ja-readme], [한국어][ko-readme].

## 目次

* [サンプルアプリ](#example-app)
* [導入方法](＃installation)
* [初期化](#initialization)   
* [イベントトラッキング](#event-tracking)
* [グローバルコールバックパラメーター](#global-callback-parameters)
* [グローバルパートナーパラメーター](#global-partner-parameters)
* [オフライン/オンラインモード](#offline-online-mode)
* [SDKの停止/再起動](#stop-restart-sdk)
* [GDPR 忘れられる権利 ](#gdpr-forget-me)
* [マーケティングのオプトアウト](＃marketing-opt-out)
* [ライセンス](#license)

## <a id="example-app">サンプルアプリ</a>

Webアプリの[サンプルアプリ][example-app]がこのリポジトリにあります。AdjustSDKをどのように使用できるか確認してください。

## <a id="installation">導入方法</a>

Adjust Web SDKをWebアプリに実装することで、インストール、セッション、イベントをトラッキングできます。

AdjustのSDKは全てのモジュール定義の下で公開されているため、CommonJSおよびAMD環境で動作し、CDNを利用して読み込まれた場合は global `Adjust`を利用することもできます。  

CDNでAdjustSDKを遅延ロードするためには、以下のコードを`<head>`タグに貼り付けます。  

```html
<script type="application/javascript">
!function(t,a,e,r,s,l,d,n,o){t.Adjust=t.Adjust||{},t.Adjust_q=t.Adjust_q||[];for(var c=0;c<l.length;c++)d(t.Adjust,t.Adjust_q,l[c]);n=a.createElement("script"),o=a.getElementsByTagName("script")[0],n.async=!0,n.src="https://cdn.adjust.com/adjust-latest.min.js",n.onload=function(){for(var a=0;a<t.Adjust_q.length;a++)t.Adjust[t.Adjust_q[a][0]].apply(t.Adjust,t.Adjust_q[a][1]);t.Adjust_q=[]},o.parentNode.insertBefore(n,o)}(window,document,0,0,0,["initSdk","trackEvent","addGlobalCallbackParameters","addGlobalPartnerParameters","removeGlobalCallbackParameter","removeGlobalPartnerParameter","clearGlobalCallbackParameters","clearGlobalPartnerParameters","switchToOfflineMode","switchBackToOnlineMode","stop","restart","gdprForgetMe","disableThirdPartySharing"],function(t,a,e){t[e]=function(){a.push([e,arguments])}});
</script>
```

Adjust Web SDKはページごとに1回だけ読み込まれ、ページの読み込みごとに1回起動される必要があります。

CDNを利用してSDKをロードするときは、縮小バージョンを使用することを推奨します。そうすることで、   `https://cdn.adjust.com/adjust-5.1.2.min.js` のような特定のバージョンをターゲットにしたり、あるいは   ターゲットファイルを変更せずに自動更新する場合は、最新バージョン    `https：//adjust.com/adjust-latest.min.js` をターゲットにすることが可能です。   SDKファイルはキャッシュされるため即時に提供され、更新は30分ごとに行われます。すぐに更新する必要がある場合は、必ず特定のバージョンをターゲットにしてください。  

また、NPMを利用してSDKをインストールすることも可能です：

```
npm install @adjustcom/adjust-web-sdk --save
```

## <a id="initialization">初期化</a>

Adjust Web SDKを初期化するためには、できるだけ早く`Adjust.initSdk`メソッドを呼び出す必要があります。

```js
Adjust.initSdk({
  appToken: 'YOUR_APP_TOKEN',
  environment: 'production'
});
```
 
以下は、`initSdk`メソッドに使用できるパラメーターの全リストです。

### 必須パラメーター

<a id="app-token">**appToken**</a> `string`

初期化メソッドに必要なパラメーターです。有効なアプリトークンを指定してください。

<a id="environment">**environment**</a> `string` 

このパラメーターも必須です。利用可能なオプションは`production`または`sandbox`です。SDKをWebアプリでテストする場合は、`sandbox`を使用します

### オプションのパラメーター
 
<a id="attribution-callback">**attributionCallback**</a> `function`

このパラメーターは、アトリビューションの変化を通知するためのコールバック関数です。コールバックには2つの引数が指定されます。1つ目は内部のイベント名（指定する必要はありません）で、もう1つは変化したアトリビューションに関する情報を保持するオブジェクトです。

例：
```js
Adjust.initSdk({
  // ... 必須パラメーターを含む他のパラメーターがここに移動します
  attributionCallback: function (e, attribution) {
    // e: 内部のイベント名、指定する必要はありません
    //attribution: 変化したアトリビューションに関する詳細
  }
});
```

<a id="default-tracker">**defaultTracker**</a> `string`

デフォルトでは、広告キャンペーンにアトリビュートされていないユーザーはアプリのオーガニックにアトリビュートされます。この動作を上書きし、このタイプのトラフィックが別のトラッカーの下にアトリビュートされるようにしたい場合は、このメソッドを使用して別のデフォルトのトラッカーを設定できます。

<a id="custom-url">**customUrl**</a> `string`

デフォルトでは、全てのリクエストがAdjustのエンドポイントに送信されます。全てのリクエストを指定のエンドポイントにリダイレクトするよう設定することも可能です。 

<a id="event-deduplication-list-limit">**eventDeduplicationListLimit**</a> `number`

デフォルトでは、このパラメーターは「10」に設定されています。この制限をオーバーライドすることは可能ですが、必ず正数にし、大きすぎないようにしてください。これにより最後の「n」個の重複排除ID（このパラメーターで定義）がキャッシュされ、それらを使用して重複したIDを持つイベントが除外されます。

<a id="log-level">**logLevel**</a> `string`

デフォルトでは、このパラメーターは`error`に設定されています。可能な値は、`none`、`error`、`info`、`verbose`です。正確なログを確認し、SDKの実装が適切に行われていることを確認するためには、テスト時に`verbose`を使用することを強くお勧めします。
各ログレベルの詳細は次のとおりです。
- `verbose` - 特定のアクションに関連する詳細なメッセージを出力します。
- `info` - 基本的な情報メッセージのみを出力します。
- `error` - エラーメッセージのみを出力します。
- `none` - 何も出力しません。

<a id="log-output">**logOutput**</a> `string`

ログを確認したいhtmlコンテナを定義できます。これは、モバイルデバイスでテストする場合や、画面に直接ログを表示したい場合に便利です（テストの場合のみ推奨）。


## <a id="event-tracking">イベントトラッキング</a>

Adjustを使ってイベントをトラッキングできます。ここでは、特定のボタンに対する全てのタップを計測する場合について説明します。[管理画面]で新しいイベントトークンを作成し、仮に`abc123`というイベントトークンが発行されたとします。このイベントをWebアプリからトラッキングするには、次の手順を実行する必要があります。

```js
Adjust.trackEvent({
  eventToken: 'YOUR_EVENT_TOKEN'
})
```

イベントのトラッキングは、Adjust SDKを[初期化](＃initialization)した後でのみ行ってください。
以下は、`trackEvent`メソッドに使用できるパラメーターの全リストです。

### 必須パラメーター

<a id="event-token">**eventToken**</a> `string`

イベントのトラッキングメソッドにはこのパラメーターが必要なため、有効なイベントトークンを指定してください。

### オプションのパラメーター

<a id="revenue">**revenue**</a> `number`

イベントに収益を追加したい場合（たとえば、Webアプリ内で発生した購入をトラッキングしたい場合）、このパラメーターに正の値を指定する必要があります。次のブロックで説明する[`通貨`](＃currency)パラメーターを指定することも必須です

<a id="currency">**currency**</a> `string`

収益イベントをトラッキングする場合は、このパラメーターを指定する必要があります。`JPY`、`USD`などの有効な通貨コードを使用してください。

例：

```js
Adjust.trackEvent({
  // ... 必須パラメーターを含む他のパラメーターがここに移動します
  revenue: 110,
  currency: 'JPY'
})
```

通貨コードを設定すると、Adjustは計測された課金金額を設定されたレポート通貨に自動換算します。[通貨換算についての詳細はこちら][currency-conversion]をご覧ください。

収益とイベントトラッキングの詳細については、[イベントトラッキングガイド](https://ja.help.adjust.com/tracking/revenue-events) をご覧ください。

<a id="callback-params">**callbackParams**</a> `array`

[管理画面]でイベントのコールバックURLを登録できます。イベントがトラッキングされるたびに、そのURLにGETリクエストが送信されます。`trackEvent`メソッドに渡されたマップオブジェクトに`callbackParams`パラメーターを追加することで、そのイベントにコールバックパラメーターを追加できます。その後、これらのパラメーターをコールバックURLに追加します。

たとえば、URL `https://www.mydomain.com/callback`が登録されていて、次のようにイベントをトラッキングするとします。

```js
Adjust.trackEvent({
  // ... 必須パラメーターを含む他のパラメーターがここに移動します
  callbackParams: [
    {key: 'key', value: 'value'}, 
    {key: 'foo', value: 'bar'}
  ]
})
```

この場合、Adjustは以下のGETリクエストを送信します。

    https://www.mydomain.com/callback?key=value&foo=bar

Adjustはカスタムパラメーターを保存せず、コールバックへの追加だけを行います。コールバックが登録されていない場合は、保存も送信もされないことに注意してください。

使用可能な値のリストを含むURLコールバックの詳細は、[コールバックガイド][callbacks-guide]を参照してください。

<a id="partner-params">**partnerParams**</a> `array`

Adjustでは、管理画面でパラメーターを追加して、連携を有効化したネットワークパートナーに送信することもできます。
これは上記のコールバックパラメーターと同様に機能しますが、`trackEvent`メソッドに渡されるマップオブジェクトに`partnerParams`パラメーターを追加することで追加できます。

```js
Adjust.trackEvent({
  // ... 必須パラメーターを含む他のパラメーターがここに移動します
  partnerParams: [
    {key: 'key', value: 'value'}, 
    {key: 'foo', value: 'bar'}
  ]
})
```

スペシャルパートナーとの連携方法の詳細については、[スペシャルパートナーガイド] [スペシャルパートナー]をご覧ください。

<a id="deduplication-id">**deduplicationId**</a> `string`

重複したイベントがトラッキングされないようにするために、イベント重複排除IDを指定することができます。重複排除リストの制限は、[上記](＃event-deduplication-list-limit)のように初期化構成で設定されます。

## <a id="global-callback-parameters">グローバルコールバックパラメータ</a>

グローバルコールバックパラメーターには、追加、削除、消去などのメソッドが複数あります。以下は、使用可能な各メソッドのリストです。

<a id="add-global-callback-parameters">**addGlobalCallbackParameters**</a>

グローバルコールバックパラメーターを追加することができます。これは、各セッションとイベントリクエストに自動的に追加されます。`trackEvent`メソッドに直接渡されるコールバックパラメーターは、既存のグローバルコールバックパラメーターをオーバーライドすることに注意してください。このメソッドは`array`を受け入れます。これは、`trackEvent`メソッドの[`callbackParams`](＃callback-params)パラメーターと同じ形式です。

例：

```js
Adjust.addGlobalCallbackParameters([
  {key: 'key1', value: 'value1'},
  {key: 'key2', value: 'value2'}
]);
```

<a id="remove-global-callback-parameter">**removeGlobalCallbackParameter**</a>

このメソッドに指定のキーを渡すことで、特定のコールバックパラメーターを削除できます。

例：

```js
Adjust.removeGlobalCallbackParameter('key1');
```

<a id="clear-global-callback-parameters">**clearGlobalCallbackParameters**</a>

全てのグローバルコールバックパラメーターを消去するには、このメソッドを呼び出します。

例：

```js
Adjust.clearGlobalCallbackParameters();
```

## <a id="global-partner-parameters">グローバルパートナーパラメータ</a>

グローバルパートナーパラメーターは、[グローバルコールバックパラメーター](＃global-callback-parameters)と同様の方法で追加、削除、および消去ができます。以下は、使用可能な各メソッドのリストです。


<a id="add-global-parnter-parameters">**addGlobalPartnerParameters**</a>

グローバルパートナーパラメーターを追加することができます。これは、各セッションとイベントリクエストに自動的に追加されます。`trackEvent`メソッドに直接渡されるパートナーパラメーターは、既存のグローバルパートナーパラメーターをオーバーライドすることに注意してください。このメソッドは`array`を受け入れます。これは、`trackEvent`メソッドの[`partnerParams`](＃partner-params)パラメーターと同じ形式です。

例：

```js
Adjust.addGlobalPartnerParameters([
  {key: 'key1', value: 'value1'},
  {key: 'key2', value: 'value2'}
]);
```

<a id="remove-global-partner-parameter">**removeGlobalPartnerParameter**</a>

このメソッドに指定のキーを渡すことで、特定のパートナーパラメーターを削除できます。

例：

```js
Adjust.removeGlobalPartnerParameter('key1');
```

<a id="clear-global-partner-parameters">**clearGlobalPartnerParameters**</a>

全てのグローバルパートナーパラメーターを消去するには、このメソッドを呼び出します。

例：

```js
Adjust.clearGlobalPartnerParameters();
```

## <a id="offline-online-mode">オフライン/オンラインモード</a>

デフォルトでは、Adjust SDKは常にオンラインモードで起動します。ただし、トラッキングイベントやセッションなどの全てのネットワークリクエストを一時停止したい場合は、オフラインモードにすることができます（ただし、最初のセッションはこのモードが有効化されずに送信されます）。
オフラインモードのオン/オフを切り替える方法は2つあります。

<a id="switch-to-offline-mode">**switchToOfflineMode**</a>

このメソッドはAdjust SDKをオフラインモードにします。

例：

```js
Adjust.switchToOfflineMode();
```

<a id="switch-back-to-online-mode">**switchBackToOnlineMode**</a>

このメソッドはAdjust SDKをオンラインモードに戻します。

```js
Adjust.switchBackToOnlineMode();
```

## <a id="stop-restart-sdk">SDKの停止/再起動</a>

特定の状況で、SDKの実行を完全に停止することが可能です。 
つまり、SDKがセッションとイベントのトラッキングを停止し、SDKが完全に機能しなくなります。
ただし、しばらくしてから再起動することは可能です。この機能に使用できるメソッドは次のとおりです。

<a id="stop">**stop**</a>

これにより、Adjust SDKが停止します。

例：

```js
Adjust.stop();
``` 

<a id="restart">**restart**</a>

これによりAdjust SDKが再起動します。

例：

```js
Adjust.restart();
``` 


## <a id="gdpr-forget-me">GDPR忘れられる権利</a>

EUの一般データ保護規則（GDPR)に従い、ユーザーが忘れられる権利 (GDPR Forget) を行使した場合は、Adjust SDKがAdjustのバックエンドにその情報を通知し、該当ユーザーのトラッキングを停止します。 
これに使用できるメソッドは1つあります。

<a id="gdpr-forge-me">**gdprForgetMe**</a>

このメソッドは、Adjust SDKのトラッキングを停止し、ユーザーが GDPR 忘れられる権利を行使していることをAdjustバックエンドに通知します。
このメソッドを実行した後は、AdjustSDKのトラッキングを再開することはできません。

例：

```js
```Adjust.gdprForgetMe();
```

詳細については、[こちら](https://help.adjust.com/manage-data/data-privacy/gdpr) をご覧ください。

## <a id="marketing-opt-out">マーケティング（広告）のオプトアウト</a>

マーケティングのオプトアウトには、サードパーティの共有機能を無効にする機能があります。これにより、GDPR忘れられる権利の場合と同じ方法でAdjustバックエンドに通知されます。

これに使用できるメソッドは1つあります。

<a id="disable-third-party-sharing">**disableThirdPartySharing**</a>

例：

```js
Adjust.disableThirdPartySharing();
```

## <a id="license">ライセンス</a>

Adjust SDKはMITライセンスを適用しています。

Copyright (c) 2020 Adjust GmbH, https://www.adjust.com

以下に定める条件に従い、本ソフトウェアおよび関連文書のファイル(以下「ソフトウェア」) の複製を取得する全ての人に対し、
ソフトウェアを無制限に扱うことを無償で許可します。
これには、ソフトウェアの複製を
使用、複写、変更、マージ、掲載、流通、サブライセンス、および/または販売する権利、
また、ソフトウェアを提供する相手に同じ許可を与える
権利も無制限に含まれます。

上記の著作権表示ならびに本許諾表示を、ソフトウェアの全ての
複製または重要な部分に記載するものとします。

本ソフトウェアは「現状のまま」で、明示であるか暗黙であるかを問わず、何らの保証もなく提供されます。
ここでいう保証とは、商品性、特定の目的への適合性、および権利非侵害についての保証を含みますが、それに限定されたものではありません。
いかなる場合でも、
作者または著作権者は、契約行為、不法行為、またはそれ以外であろうと、ソフトウェアに起因または関連し、あるいはソフトウェアの使用
またはその他の取り扱いによって生じる一切の請求、損害、その他の義務について
何らの責任も負わないものと
します。


[adjust.com]:   https://adjust.com
[dashboard]:    https://adjust.com
[example-app]:  src/demo.html

[callbacks-guide]:    https://ja.help.adjust.com/manage-data/raw-data-exports/callbacks
[special-partners]:   https://ja.help.adjust.com/dashboard/integrated-partners
[currency-conversion]: https://ja.help.adjust.com/tracking/revenue-events/currency-conversion

[en-readme]:  ../../README.md
[zh-readme]:  ../chinese/README.md
[ja-readme]:  ../japanese/README.md
[ko-readme]:  ../korean/README.md
