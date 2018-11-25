# iot-glasses

obnizを使った光るメガネです

どんなものかを知るのはLTしたときの様子が一番わかり易いのでこちらを見てください

[LTした時の様子](https://www.instagram.com/p/BpO6gDLDPC0/?utm_source=ig_web_button_share_sheet
)


WebのUIはこんなのです

![image](https://i.gyazo.com/e4df92387d745a55806f8aa3a490a048.gif)

## 設定

obnizのIDだけ自分の持っているものに変更する必要があるので、
server.js内の`let glasses = new Glasses("YOUR_OBNIZ_ID");`の`YOUR_OBNIZ_ID`だけ変更してください


## 実行
```
node server.js

```

[localhost:3000](http://localhost:3000/)にアクセスするとボタンがたくさん出る画面が出ます。
そのままボタンを押してもらうとメガネのライトの光り方が変わります

## デプロイ

herokuに上げるとそのまま動くようになっています。


And access to [localhost:3000](http://localhost:3000/).
