import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers"

// 支付宝用户资料接口
interface AlipayProfile {
  user_id: string
  nick_name: string
  avatar: string
}

export default function AlipayProvider<P extends AlipayProfile>(options: OAuthUserConfig<P>): OAuthConfig<P> {
  return {
    id: "alipay",
    name: "支付宝",
    type: "oauth",
    // 支付宝授权页面
    authorization: {
      url: "https://openauth.alipay.com/oauth2/publicAppAuthorize.htm",
      params: {
        app_id: options.clientId,
        redirect_uri: options.callbackUrl || "",
        scope: "auth_user",
        response_type: "code",
      },
    },
    // 获取访问令牌
    token: {
      url: "https://openapi.alipay.com/gateway.do",
      params: {
        app_id: options.clientId,
        method: "alipay.system.oauth.token",
        format: "JSON",
        charset: "utf-8",
        sign_type: "RSA2",
        version: "1.0",
        grant_type: "authorization_code",
      },
    },
    // 获取用户信息
    userinfo: {
      url: "https://openapi.alipay.com/gateway.do",
      params: {
        app_id: options.clientId,
        method: "alipay.user.info.share",
        format: "JSON",
        charset: "utf-8",
        sign_type: "RSA2",
        version: "1.0",
      },
      async request({ tokens, client }) {
        // 支付宝API需要特殊处理
        const profile = await client.userinfo(tokens.access_token)
        return profile
      },
    },
    // 处理用户资料
    profile(profile) {
      return {
        id: profile.user_id,
        name: profile.nick_name,
        email: `${profile.user_id}@alipay.user`,
        image: profile.avatar,
      }
    },
    style: {
      logo: "/alipay.svg",
      logoDark: "/alipay.svg",
      bg: "#fff",
      text: "#1677FF",
      bgDark: "#fff",
      textDark: "#1677FF",
    },
    options,
  }
}
