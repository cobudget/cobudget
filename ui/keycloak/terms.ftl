<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        <!-- ${msg("termsTitle")} -->
	Please accept the Privacy Policy and Terms and Conditions
    <#elseif section = "form">
    <div id="kc-terms-text">
        <!-- ${kcSanitize(msg("termsText"))?no_esc} -->

	Please go to the following links to read the
        <a
          href="https://www.iubenda.com/privacy-policy/58637640"
          target="_blank"
          rel="noreferrer"
        >
          Privacy Policy
        </a>
        and the
        <a
          href="https://www.iubenda.com/terms-and-conditions/58637640"
          target="_blank"
          rel="noreferrer"
        >
          Terms and Conditions
	</a>

    </div>
    <form class="form-actions" action="${url.loginAction}" method="POST">
        <input class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonLargeClass!}" name="accept" id="kc-accept" type="submit" value="${msg("doAccept")}"/>
        <input class="${properties.kcButtonClass!} ${properties.kcButtonDefaultClass!} ${properties.kcButtonLargeClass!}" name="cancel" id="kc-decline" type="submit" value="${msg("doDecline")}"/>
    </form>
    <div class="clearfix"></div>
    </#if>
</@layout.registrationLayout>
