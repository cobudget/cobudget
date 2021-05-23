# extract a file like this if we haven't already
docker exec keycloak.web.1 cat /opt/jboss/keycloak/themes/plato/login/terms.ftl > terms.ftl
# back to it (could prob use the docker cp command to extract from it as well tbh)
docker cp terms.ftl keycloak.web.1:/opt/jboss/keycloak/themes/plato/login/terms.ftl