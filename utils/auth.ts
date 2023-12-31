import { UserManager } from "oidc-client-ts";

export const getUserManager = () => {
  const userManager = new UserManager({
    authority: "https://login.portal.aixigo.cloud/realms/apps",
    client_id: "website",
    redirect_uri: window.location.href + "/redirect",
    response_mode: "fragment",
    scope: "openid email roles",
    loadUserInfo: true,
    automaticSilentRenew: true,
    includeIdTokenInSilentRenew: true,
    fetchRequestCredentials: "include",
  });

  return userManager;
};

export const getAPIToken = async () => {
  const userManager = getUserManager();

  const user = await userManager.getUser();
  console.log(user);
  if (!user) {
    await userManager.signinRedirect();
  }
  if (user) {
    return user.id_token || user.access_token;
  }
};
