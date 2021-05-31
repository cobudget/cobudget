# extract a file like this if we haven't already
docker exec keycloak.web.1 cat /opt/jboss/keycloak/themes/plato/login/terms.ftl > terms.ftl
# back to it (could prob use the docker cp command to extract from it as well tbh)
docker cp terms.ftl keycloak.web.1:/opt/jboss/keycloak/themes/plato/login/terms.ftl

# if customizing a keycloak webpage, it's probably easier to copy the relevant
# files from keycloakify
# the above steps i think are mostly useful when dealing with email related files
# since keycloakify doesn't handle email styling yet
# https://github.com/InseeFrLab/keycloakify/issues/9

# run storybook to easily preview the theme in development
npm run storybook

# build the theme jar file
npm run keycloak

# to upload the file to the server
cd build_keycloak/target
sftp root@realities-api.platoproject.org
put keycloak-theme-keycloak-theme-0.1.0.jar

# on the server
docker cp keycloak-theme-keycloak-theme-0.1.0.jar keycloak.web.1:/opt/jboss/keycloak/standalone/deployments/

# note that there have been issues with updating to a new version of the theme,
# keycloak doesn't seem to want to get rid of the older version. until we come
# up with a better solution you might have to reboot stuff until the old theme
# is gone

---------

# for now you need to manually add the email theme
# first create a "plato" theme if it doesn't exist (e.g. after a reboot) 
cd /opt/jboss/keycloak/themes/
cp -r keycloak plato
cd plato/email/
mkdir messages
# and then move the messages file so it's at
# /opt/jboss/keycloak/themes/plato/email/messages/messages_en.properties
