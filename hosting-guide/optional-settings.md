# Optional settings

## Level roles

Setting "AUTOROLE" to "true" allows the bot to give users roles based on their linked account's level/supporter status. It updates roles every 15 minutes. In order for this to work the bot must have the Manage Roles permission, and all of the role ID's within the section need to be set. A finished example looks something like this:

```bash
# AUTOROLE SETTINGS
AUTOROLE=true
SUPPORTERROLE=342503778408464386
LEVEL100ROLE=379757023899942933
LEVEL200ROLE=379757163679055892
LEVEL300ROLE=379757273397854210
LEVEL400ROLE=379757385490890764
LEVEL500ROLE=380501324472647690
LEVEL600ROLE=469099524934205441
```

### VC role

Setting "VCROLE" to "true" allows the bot to give users a role when they join a voice chat, and take it when they leave. In order for this to work the bot must have the Manage Roles permission, and the VC role ID must be set. A finished example looks something like this:

```bash
# VC ROLE SETTINGS
VCROLE=true
VCROLEID=614141830036062408
```



