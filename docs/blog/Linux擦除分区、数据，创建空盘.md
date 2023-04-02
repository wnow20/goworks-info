# Linux擦除分区、数据，创建空盘

## `**dd**`** 命令**

非安全擦除，数据可恢复


```shell
# lsblk -f
fdisk /dev/sdb
dd if=/dev/zero of=/dev/hdX  bs=512  count=1
fdisk -l /dev/sdb
```

## `shred` 安全擦除


```shell
shred -n 5 -vz /dev/sdb
```

数据不可恢复

## `scrub` 安全擦除


```shell
scrub -p dod /dev/sdb
```

<br/>

