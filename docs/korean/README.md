## 요약

본 문서는 웹사이트 또는 웹앱을 위한 Adjust™ Javascript SDK 용 가이드입니다. Adjust™에 대한 자세한 정보는 [adjust.com]에서 확인하십시오.

Read this in other languages: [English][en-readme], [中文][zh-readme], [日本語][ja-readme], [한국어][ko-readme].

## 목차

* [앱 예시](#example-apps)
* [설치](#installation)
* [초기화](#initialization)   
* [이벤트 추적](#event-tracking)
* [글로벌 콜백 파라미터](#global-callback-parameters)
* [글로벌 파트너 파라미터](#global-partner-parameters)
* [오프라인/온라인 모드](#offline-online-mode)
* [SDK 중지/ 재시작](#stop-restart-sdk)
* [GDPR 잊혀질 권리](#gdpr-forget-me)
* [마케팅 옵트 아웃](#marketing-opt-out)
* [라이선스](#license)

## <a id="example-app">앱 예시</a>

이 리포지토리의 [예시 앱][example-app] 을 확인하여 SDK가 웹 앱에서 어떻게 사용되는지 확인할 수 있습니다.

## <a id="installation">설치</a>

이 SDK는 설치, 세션, 이벤트 트래킹에 사용될 수 있습니다. Adjust 웹 SDK를 웹 앱에 추가하기만 하면 됩니다.

Adjust SDK는 CommonJS와 AMD 환경에서 작동하고 CDN을 통해 로딩될 때 글로벌 `Adjust`를 통해 사용할 수 있도록 모든 모듈 정의 아래에 노출되어있습니다.  

레이지 로딩을 위해 Adjust 웹 SDK는 CDN을 통해 다음 스니펫을 `<head>` 태그에 붙입니다:  

```html
<script type="application/javascript">
!function(t,a,e,r,s,n,l,d,o){t.Adjust=t.Adjust||{},t.Adjust_q=t.Adjust_q||[];for(var c=0;c<n.length;c++)l(t.Adjust,t.Adjust_q,n[c]);d=a.createElement("script"),o=a.getElementsByTagName("script")[0],d.async=!0,d.src="https://cdn.adjust.com/adjust-latest.min.js",d.onload=function(){for(var a=0;a<t.Adjust_q.length;a++)t.Adjust[t.Adjust_q[a][0]].apply(t.Adjust,t.Adjust_q[a][1]);t.Adjust_q=[]},o.parentNode.insertBefore(d,o)}(window,document,0,0,0,["initSdk","trackEvent","addGlobalCallbackParameters","addGlobalPartnerParameters","removeGlobalCallbackParameter","removeGlobalPartnerParameter","clearGlobalCallbackParameters","clearGlobalPartnerParameters","switchToOfflineMode","switchBackToOnlineMode","stop","restart","gdprForgetMe","disableThirdPartySharing","initSmartBanner"],function(t,a,e){t[e]=function(){a.push([e,arguments])}});
</script>
```

Adjust 웹 SDK는 페이지당 한 번만 로딩되어야 하며 페이지 로딩당 한번만 초기화되어야 합니다. 

CDN을 통해 SDK를 로딩할 때 축소 버전을 사용하는 것이 좋습니다. `https://cdn.adjust.com/adjust-5.3.0.min.js`와 같은 특정 버전을 타깃팅하거나 대상 파일을 변경할 필요 없이 자동 업데이트를 원하는 경우 최신 버전`https://cdn.adjust.com/adjust-latest.min.js`을 타깃팅 합니다. sdk 파일은 캐싱되어 최대한 빠르게 제공되며 30분 마다 캐시가 새로고침됩니다. 즉시 업데이트를 원하는 경우에는 특정 버전을 타깃팅해야 합니다.

NPM을 통한 SDK 설치 역시 가능합니다:

```
npm install @adjustcom/adjust-web-sdk --save
```


## <a id="initialization">초기화</a>

Adjust Web SDK를 초기화하려면 반드시 Adjust.initSdk` 메서드를 최대한 빠르게 호출해야 합니다.

```js
Adjust.initSdk({
  appToken: 'YOUR_APP_TOKEN',
  environment: 'production'
});
```
 
다음은 `initSdk` 메서드에 사용 가능한 파리미터의 전체 리스트입니다.

### 필수 파라미터 

<a id="app-token">**appToken**</a> `string`

초기화 메서드에는 이 파라미터가 필요하므로 유효한 앱토큰을 제공해야 합니다

<a id="environment">**environment**</a> `string` 

이 파라미터 역시 필수입니다. 사용가능한 옵션으로는 `production` 또는 `sandbox가 있습니다. 웹앱으로 로컬에서 SDK를 테스트하는 경우 sandbox`를 사용하십시오. 

### 선택적 파라미터
 
<a id="attribution-callback">**attributionCallback**</a> `함수`

이 파라미터는 함수를 허용하며 어트리뷰션 변경에 대한 콜백 함수입니다. 콜백에 두개의 인수가 제공됩니다. 첫번째는 내부 이벤트 이름이며(무시할 수 있음) 또 다른 하나는 변경된 어트리뷰션에 대한 정보를 담고 있는 object입니다.

예시:
```js
Adjust.initSdk({
  // ... 필수 파라미터를 포함하는 다른 파라미터가 여기에 들어갑니다 
  attributionCallback: function (e, attribution) {
    // e: 내부 이벤트 이름, 무시할 수 있음 
    // 어트리뷰션: 변경된 어트리뷰션에 대한 상세 정보
  }
});
```

<a id="default-tracker">**defaultTracker**</a> `string`

기본적으로 캠페인에 어트리뷰션되지 않은 사용자는 앱의 오가닉 트래커로 어트리뷰션됩니다. 이 동작을 덮어쓰고 다른 트래커에서 이 유형의 트래픽을 어트리뷰션하고 싶다면, 이 메서드를 사용하여 다른 디폴트 트래커를 설정할 수 있습니다.

<a id="custom-url">**customUrl**</a> `string`

기본적으로 모든 요청은 adjust의 엔드포인트로 이동합니다.  커스텀 엔드포인트로 모든 요청을 리디렉션하는 것이 가능합니다.  

<a id="event-deduplication-list-limit">**eventDeduplicationListLimit**</a> `number`

이 파라미터는 기본적으로 10으로 설정되어 있습니다. 이 제한을 오버라이드하는 것은 가능하지만 반드시 양수여야 하며 너무 큰 숫자는 될 수 없습니다. 이를통해 마지막 `n` deduplication ids를 캐싱하며(이 파라미터로 정의된), 반복 ID로 이벤트 중복을 제거(deduplicate)하는데 사용됩니다.

<a id="log-level">**logLevel**</a> `string`

기본적으로 이 파라미터는 error로 설정되어 있습니다. 사용가능한 값으로는 `none`, `error`, `info`, `verbose`이 있습니다.  정확한 로그를 보고 연동이 제대로 되었는지 확인을 위한 테스트를 진행할 때는 verbose를 사용하는 것을 적극 권장합니다.
각 로그 수준에 대한 세부 정보는 아래를 참고하십시오.
- `verbose` - 특정 동작의 경우 세부적인 메세지를 출력합니다 
- `info` - 기본적인 정보 메세지만을 출력합니다
- `error` - 에러 메세지만을 출력합니다 
- `none` - 아무 메세지도 출력하지 않습니다 

<a id="log-output">**logOutput**</a> `string`

로그를 확인하기 위한 html 컨테이너를 정의할 수 있습니다. 모바일 기기 상의 테스트나 로그를 직접 화면에서 확인하고자 할 때 유용합니다. (테스트에만 사용 권장)


## <a id="event-tracking">이벤트 트래킹</a>

Adjust를 사용하여 이벤트를 트래킹할 수 있습니다. 특정 버튼에 대한 모든 클릭을 트래킹하려는 경우를 가정해 보겠습니다. adjust 대시보드에서 이벤트 토큰을 생성합니다. 이는 'abc123'와 같은 형태입니다. 웹 앱에서 이 이벤트를 트래킹하려면 다음을 수행해야 합니다.

```js
Adjust.trackEvent({
  eventToken: 'YOUR_EVENT_TOKEN'
})
```

반드시 Adjust SDK [초기화](#initialization) 이후에 이벤트를 트래킹하여야 합니다.
다음은`trackEvent` 메서드에 대해 사용 가능한 파라미터의 전체 리스트입니다.

### 필수 파라미터

<a id="event-token">**eventToken**</a> `string`

Track event 메서드에는 이 파라미터가 필요하므로 올바른 이벤트 토큰을 사용해야 합니다. 

### 선택적 파라미터

<a id="revenue">**revenue**</a> `number`

이벤트에 매출을 추가하는 경우(예를 들어 웹앱 내에서 발생한 구매를 트래킹하려는 경우) 이 파라미터에 대한 양의 값(positive value)을 제공해야 합니다. 또한 다음 블록에 설명된 [`통화`](#currency) 파라미터를 제공해야 합니다.

<a id="currency">**currency**</a> `string`

매출 이벤트를 트래킹하려면 이 파라미터를 제공해야 합니다. `EUR`, `USD`와 같은 유효한 통화를 사용하십시오

예시:

```js
Adjust.trackEvent({
  // ... 필수 파라미터를 포함하는 다른 파라미터가 여기에 들어갑니다
  revenue: 110,
  currency: 'EUR'
})
```

사용자가 통화 토큰을 설정하면 Adjust는 사용자가 대시보드에 설정한 통화에 따라 수신되는 매출을 리포팅 매출로 자동 변환합니다. [통화 변환과 관련해서는 여기에서][currency-conversion] 자세히 읽어보시길 바랍니다.

[이벤트 트래킹 가이드](https://help.adjust.com/tracking/revenue-events)에서 매출과 이벤트 트래킹에 대한 자세한 내용을 확인하실 수 있습니다.

<a id="callback-params">**callbackParams**</a> `array`

[대시보드]에서 이벤트를 위한 콜백 URL을 등록할 수 있습니다. 그러면 Adjust는 이벤트가 트래킹될 때마다 해당 URL에 GET 요청을 보냅니다. callback_params 파라미터를 trackEvent 메서드로 전달된 맵 객체에 추가하여 해당 이벤트에 콜백 파라미터를 추가할 수 있습니다. 그런 다음 Adjust는 이러한 파라미터를 사용자의 콜백 URL에 추가합니다.

예를 들어, 사용자가 https://www.mydomain.com/callback URL을 등록했으며 다음과 같은 이벤트를 트래킹한다고 가정해 보겠습니다.

```js
Adjust.trackEvent({
  // ... 필수 파라미터를 포함하는 다른 파라미터가 여기에 들어갑니다
  callbackParams: [
    {key: 'key', value: 'value'}, 
    {key: 'foo', value: 'bar'}
  ]
})
```

이 경우, Adjust가 이벤트를 추적하여 다음으로 요청을 전송합니다.

    https://www.mydomain.com/callback?key=value&foo=bar

Adjust는 커스텀 파라미터를 보관하지 않으며, 콜백에 추가만 하기때문에 대시보드에서 추가적인 콜백설정을 하지 않았다 커스텀 파라미터가 저장되거나 사용자에게 전송되지 않습니다.

Adjust [callbacks guide][callbacks-guide]에서 사용 가능한 값의 전체 리스트를 비롯하여 URL 콜백을 사용하는 방법을 자세히 알아보실 수 있습니다.

<a id="partner-params">**partnerParams**</a> `array`

Adjust 대시보드에서 활성화된 네트워크 파트너로 전송될 파라미터를 추가할 수도 있습니다.
이는 앞서 언급한 콜백 파라미터와 유사하게 작동하지만, partner_params 파라미터를 trackEvent 메서드로 전달된 map object에 추가하는 방식이 있습니다.

```js
Adjust.trackEvent({
  // ... 필수 파라미터를 포함하는 다른 파라미터는 여기에 들어갑니다
  partnerParams: [
    {key: 'key', value: 'value'}, 
    {key: 'foo', value: 'bar'}
  ]
})
```

[특별 파트너 가이드][special-partners]에서 특별 파트너와 연동 방법에 대한 자세한 내용을 알아보실 수 있습니다.

<a id="deduplication-id">**deduplicationId**</a> `string`

중복 이벤트 트래킹을 피하기 위해 이벤트 중복제거 id를 제공할 수 있습니다. 중복 제거 리스트 제한은 [위에서](#event-deduplication-list-limit) 설명된 대로 초기화 구성에 설정되어 있습니다.

## <a id="global-callback-parameters">글로벌 콜백 파라미터</a>

추가, 제거 또는 지우기와 같은 글로벌 콜백 파라미터에 사용될 수 있는 몇 가지 메서드가 있습니다. 사용 가능한 각 메서드의 목록은 다음과 같습니다: 

<a id="add-global-callback-parameters">**addGlobalCallbackParameters**</a>

각 세션 및 이벤트 요청에 자동으로 추가되는 글로벌 콜백 파라미터를 추가할 수 있습니다. `trackEvent` 매서드로 직접 전달되는 콜백 파라미터는 기존의 글로벌 콜백 파라미터를 오버라이딩합니다.  이 메서드는 `trackEvent` 메서드의 [`callbackParams`](#callback-params) 파리미터와 동일한 형식을 갖는 것을 허용합니다. 

예시:

```js
Adjust.addGlobalCallbackParameters([
  {key: 'key', value: 'value'},
  {key: 'key', value: 'value'},
]);
```

<a id="remove-global-callback-parameter">**removeGlobalCallbackParameter**</a>

특정 콜백 파라미터를 제거하기 위해서는 제거가 필요한 글로벌 콜백 파라미터의 키를 제공하여 이 메서드를 사용하십시오.

예시:

```js
Adjust.removeGlobalCallbackParameter('key1');
```

<a id="clear-global-callback-parameters">**clearGlobalCallbackParameters**</a>

모든 글로벌 콜백 파라미터를 지우기 위해서는 이 메서드를 호출하십시오 

예시:

```js
Adjust.clearGlobalCallbackParameters();
```

## <a id="global-partner-parameters">글로벌 파트너 파라미터</a>

[글로벌 콜백 파라미터](#global-callback-parameters)와 비슷한 방법으로 글로벌 파트너 파라미터를 추가 또는 제거 할 수 있습니다. 사용 가능한 각 메서드의 목록은 다음과 같습니다:


<a id="add-global-parnter-parameters">**addGlobalPartnerParameters**</a>

각 세션 및 이벤트 요청에 자동으로 추가되는 글로벌 콜백 파라미터를 추가할 수도 있습니다. `trackEvent` 메서드에 직접 전달되는 파트너 파라미터는 기존 글로벌 파트너 파라미터를 오버라이딩합니다. 이 메서드는 `trackEvent` 메서드의 [`partnerParams`](#partner-params) 파리미터와 동일한 형식을 갖는 것을 허용합니다.

예시:

```js
Adjust.addGlobalPartnerParameters([
  {key: 'key', value: 'value'},
  {key: 'key', value: 'value'},
]);
```

<a id="remove-global-partner-parameter">**removeGlobalPartnerParameter**</a>

특정 파트너 파라미터를 제거하기 위해서는 제거가 필요한 글로벌 파트너 파라미터의 키를 제공하여 이 메서드를 사용하십시오.

예시:

```js
Adjust.removeGlobalPartnerParameter('key1');
```

<a id="clear-global-partner-parameters">**clearGlobalPartnerParameters**</a>

모든 글로벌 파트너 파라미터를 지우기 위해서는 이 메서드를 호출하십시오

예시:

```js
Adjust.clearGlobalPartnerParameters();
```

## <a id="offline-online-mode">오프라인/온라인 모드</a>

Adjust SDK가 시작되면 온라인 모드로 기본 설정되어 있습니다.  하지만 트래킹 이벤트와 세션(초기 세션에 대해서는 이 모드는 무시되며 전송됩니다)과 같은 모든 네트워크 요청을 일시 중지하기 위해서는 오프라인 모드로 전환이 가능합니다.
오프라인 모드를 시작 및 종료하기 위한 두가지 메서드가 있습니다.:

<a id="switch-to-offline-mode">**switchToOfflineMode**</a>

이 메서드는 Adjust SDK를 오프라인 모드로 전환합니다.

예시:

```js
Adjust.switchToOfflineMode();
```

<a id="switch-back-to-online-mode">**switchBackToOnlineMode**</a>

이 메서드는 Adjust SDK를 온라인 모드로 전환합니다.

```js
Adjust.switchBackToOnlineMode();
```

## <a id="stop-restart-sdk">SDK 중지/재시작</a>

특정 상황에서 SDK 실행을 완전히 중지하는 것도 가능합니다. 
이는 SDK가 세션 및 이벤트 트래킹을 중단하고 작동을 중단하게 된는 것을 의미합니다.
시간이 어느 정도 지난 후에 재시작이 가능합니다. 이 기능에 사용할 수 있는 메서드는 다음과 같습니다.

<a id="stop">**stop**</a>

이 메서드를 사용하면 Adjust SDK 실행이 중지됩니다.

예시:

```js
Adjust.stop();
``` 

<a id="restart">**restart**</a>

이 메서드를 사용하면 Adjust SDK가 재시작됩니다.

예시:

```js
Adjust.restart();
``` 


## <a id="gdpr-forget-me">GDPR 잊혀질 권리</a>

이 기능은 GDPR의 잊혀질 권리를 행사하기 원하는 사용자가 사용할 수 있습니다. 이 기능을 사용하면 백엔드에 알림과 함께 Adjust SDK 실행이 중지됩니다. 
이 기능에 사용이 가능한 메서드가 하나 있습니다.

<a id="gdpr-forge-me">**gdprForgetMe**</a>

이 메서드는 Adjust SDK 실행을 중지시키고 사용자가 GDPR 잊혀질 권리를 행사하길 원한다는 알림을 adjust 백엔드에 전송합니다.
이 메서드가 실행되면 더이상 Adjust SDK를 재시작할 수 없습니다.

예시:

```js
Adjust.gdprForgetMe();
```

자세한 내용은 [여기](https://help.adjust.com/manage-data/data-privacy/gdpr)에서 확인하실 수 있습니다.

## <a id="marketing-opt-out">마케팅 옵트아웃</a>

이 기능은 써드파티 공유 기능을 비활성화하는 마케팅 옵트아웃을 위해 사용됩니다. 이 기능은 GDPR 잊혀질 권리와 같은 방식으로 백엔드에 알림을 전달합니다.

사용할 수 있는 유일한 메서드로는 다음이 있습니다.

<a id="disable-third-party-sharing">**disableThirdPartySharing**</a>

예시:

```js
Adjust.disableThirdPartySharing();
```

## <a id="license">라이센스</a>

Adjust SDK는 MIT 라이센스 하에 사용이 허가됩니다.

Copyright (c) 2020 Adjust GmbH, https://www.adjust.com

다음 조건하에서 본 소프트웨어와 관련 문서 파일
(이하 "소프트웨어")의 사본을 보유한 제3자에게 소프트웨어의
사용, 복사, 수정, 병합, 게시, 배포, 재실시권 및/또는 사본의 판매 등을 포함하여
소프트웨어를 제한 없이 사용할 수 있는 권한을 무료로 부여하며,
해당 제3자는 소프트웨어를 보유한 이에게
이러한 이용을 허가할 수 있습니다.

본 소프트웨어의 모든 사본 또는 상당 부분에
위 저작권 공고와 본 권한 공고를 포함해야 합니다.

소프트웨어는 "있는 그대로" 제공되며,
소프트웨어의 상품성과 특정 목적에의 적합성 및 비 침해성에 대해
명시적이거나 묵시적인 일체의 보증을 하지 않습니다. 저자 또는 저작권자는
본 소프트웨어나 이의 사용 또는 기타 소프트웨어 관련 거래로 인해
발생하는 모든 클레임, 손해 또는 기타 법적 책임에 있어서
계약 또는 불법 행위와 관련된 소송에 대해 어떠한 책임도 부담하지
않습니다.


[adjust.com]: https://adjust.com
[dashboard]:  https://adjust.com
[example-app]:  src/demo.html

[callbacks-guide]:      https://help.adjust.com/manage-data/raw-data-exports/callbacks
[special-partners]:     https://help.adjust.com/dashboard/integrated-partners
[currency-conversion]:  https://help.adjust.com/tracking/revenue-events/currency-conversion

[en-readme]:  ../../README.md
[zh-readme]:  ../chinese/README.md
[ja-readme]:  ../japanese/README.md
[ko-readme]:  ../korean/README.md
