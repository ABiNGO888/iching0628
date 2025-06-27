import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers"

// 微信用户资料接口
interface WechatProfile {
  openid: string
  nickname: string
  sex: number
  language: string
  city: string
  province: string
  country: string
  headimgurl: string
  privilege: string[]
  unionid: string
}

export default function WechatProvider<P extends WechatProfile>(options: OAuthUserConfig<P>): OAuthConfig<P> {
  return {
    id: "wechat",
    name: "微信",
    type: "oauth",
    // 微信网页授权
    authorization: {
      url: "https://open.weixin.qq.com/connect/qrconnect",
      params: {
        appid: options.clientId,
        redirect_uri: options.callbackUrl || "",
        response_type: "code",
        scope: "snsapi_login",
      },
    },
    // 获取访问令牌
    token: {
      url: "https://api.weixin.qq.com/sns/oauth2/access_token",
      params: {
        appid: options.clientId,
        secret: options.clientSecret,
        grant_type: "authorization_code",
      },
    },
    // 获取用户信息
    userinfo: {
      url: "https://api.weixin.qq.com/sns/userinfo",
      params: { openid: "openid", lang: "zh_CN" },
      async request({ tokens, client, provider }) {
        const profile = await client.userinfo(tokens.access_token, {
          params: { openid: tokens.openid },
        })
        return profile
      },
    },
    // 处理用户资料
    profile(profile) {
      return {
        id: profile.unionid || profile.openid,
        name: profile.nickname,
        email: `${profile.unionid || profile.openid}@wechat.user`,
        image: profile.headimgurl,
      }
    },
    style: {
      logo: "/wechat.svg",
      logoDark: "/wechat.svg",
      bg: "#fff",
      text: "#07C160",
      bgDark: "#fff",
      textDark: "#07C160",
    },
    options,
  }
}
