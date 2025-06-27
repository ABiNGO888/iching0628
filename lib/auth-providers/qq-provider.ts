import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers"

// QQ用户资料接口
interface QQProfile {
  ret: number
  msg: string
  openid: string
  nickname: string
  figureurl_qq_1: string
  figureurl_qq_2: string
}

export default function QQProvider<P extends QQProfile>(options: OAuthUserConfig<P>): OAuthConfig<P> {
  return {
    id: "qq",
    name: "QQ",
    type: "oauth",
    // QQ授权页面
    authorization: {
      url: "https://graph.qq.com/oauth2.0/authorize",
      params: {
        client_id: options.clientId,
        redirect_uri: options.callbackUrl || "",
        response_type: "code",
        scope: "get_user_info",
      },
    },
    // 获取访问令牌
    token: {
      url: "https://graph.qq.com/oauth2.0/token",
      params: {
        client_id: options.clientId,
        client_secret: options.clientSecret,
        grant_type: "authorization_code",
        fmt: "json",
      },
    },
    // 获取用户信息
    userinfo: {
      url: "https://graph.qq.com/user/get_user_info",
      async request({ tokens, client, provider }) {
        // 获取OpenID
        const openIdResponse = await fetch(
          `https://graph.qq.com/oauth2.0/me?access_token=${tokens.access_token}&fmt=json`,
        )
        const openIdData = await openIdResponse.json()
        const openId = openIdData.openid

        // 获取用户信息
        const profile = await client.userinfo(tokens.access_token, {
          params: {
            oauth_consumer_key: options.clientId,
            openid: openId,
          },
        })
        return { ...profile, openid: openId }
      },
    },
    // 处理用户资料
    profile(profile) {
      return {
        id: profile.openid,
        name: profile.nickname,
        email: `${profile.openid}@qq.user`,
        image: profile.figureurl_qq_2 || profile.figureurl_qq_1,
      }
    },
    style: {
      logo: "/qq.svg",
      logoDark: "/qq.svg",
      bg: "#fff",
      text: "#12B7F5",
      bgDark: "#fff",
      textDark: "#12B7F5",
    },
    options,
  }
}
